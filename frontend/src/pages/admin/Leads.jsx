import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Upload, Plus, X, FileText, Search, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    property_address: '',
    city: '',
    state: '',
    zip_code: '',
    mailing_address: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: '',
  });
  const [csvData, setCSVData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [headerMapping, setHeaderMapping] = useState({});
  const [showMappingStep, setShowMappingStep] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [distributeCount, setDistributeCount] = useState(1);
  const [selectedUser, setSelectedUser] = useState('');
  const [allUsers, setAllUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const { data } = await adminAPI.getLeads();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await adminAPI.createLead(formData);
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        property_address: '',
        city: '',
        state: '',
        zip_code: '',
        mailing_address: '',
        mailing_city: '',
        mailing_state: '',
        mailing_zip: '',
      });
      fetchLeads();
      alert('Lead created successfully!');
    } catch (error) {
      console.error('Failed to create lead:', error);
      alert('Failed to create lead');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileName = file.name.toLowerCase();
    const isValidFile = validTypes.includes(file.type) || fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isValidFile) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setCsvFile(file);

    // Check if it's an Excel file
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
                    file.type === 'application/vnd.ms-excel' || 
                    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (isExcel) {
      // Parse Excel file
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const workbook = XLSX.read(bstr, { type: 'binary' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            alert('The Excel file is empty');
            return;
          }
          
          // First row is headers
          const headers = jsonData[0].map(h => String(h || '').trim()).filter(h => h);
          
          // Rest are data rows - convert to objects
          const rows = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = {};
            let hasData = false;
            headers.forEach((header, index) => {
              const value = jsonData[i][index];
              if (value !== undefined && value !== null && value !== '') {
                row[header] = String(value).trim();
                hasData = true;
              }
            });
            if (hasData) {
              rows.push(row);
            }
          }
          
          if (rows.length === 0) {
            alert('No data found in Excel file');
            return;
          }
          
          setCsvHeaders(headers);
          setCsvRows(rows);
          
          // Initialize header mapping with empty values
          const initialMapping = {};
          headers.forEach(header => {
            initialMapping[header] = '';
          });
          setHeaderMapping(initialMapping);
          
          // Move to mapping step
          setShowMappingStep(true);
        } catch (error) {
          console.error('Excel parsing error:', error);
          alert('Failed to parse Excel file: ' + error.message);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            alert('The file is empty or invalid');
            return;
          }

          // Get headers from the CSV
          const headers = results.meta.fields || [];
          setCsvHeaders(headers);
          setCsvRows(results.data);
          
          // Initialize header mapping with empty values
          const initialMapping = {};
          headers.forEach(header => {
            initialMapping[header] = '';
          });
          setHeaderMapping(initialMapping);
          
          // Move to mapping step
          setShowMappingStep(true);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          alert('Failed to parse CSV file');
        }
      });
    }
  };

  const handleMappingChange = (csvHeader, dbField) => {
    setHeaderMapping(prev => ({
      ...prev,
      [csvHeader]: dbField
    }));
  };

  // Get available database fields for a specific CSV header
  // Excludes fields that are already mapped to other CSV headers
  const getAvailableDbFields = (currentCsvHeader) => {
    const allDbFields = [
      { value: 'first_name', label: 'First Name' },
      { value: 'last_name', label: 'Last Name' },
      { value: 'full_name', label: 'Full Name' },
      { value: 'phone', label: 'Phone Number' },
      { value: 'property_address', label: 'Property Address' },
      { value: 'city', label: 'Property City' },
      { value: 'state', label: 'Property State' },
      { value: 'zip_code', label: 'Property Zip' },
      { value: 'mailing_address', label: 'Mailing Address' },
      { value: 'mailing_city', label: 'Mailing City' },
      { value: 'mailing_state', label: 'Mailing State' },
      { value: 'mailing_zip', label: 'Mailing Zip' },
    ];

    // Get all currently mapped values except for the current CSV header
    const mappedValues = Object.entries(headerMapping)
      .filter(([csvHeader, dbField]) => csvHeader !== currentCsvHeader && dbField !== '')
      .map(([_, dbField]) => dbField);

    // Return only fields that haven't been mapped yet
    return allDbFields.filter(field => !mappedValues.includes(field.value));
  };

  const handleCSVUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    
    try {
      // Transform CSV data based on header mapping
      setUploadProgress(10);
      const mappedData = csvRows.map(row => {
        const mappedRow = {};
        
        // Map each CSV header to database field
        Object.keys(headerMapping).forEach(csvHeader => {
          const dbField = headerMapping[csvHeader];
          if (dbField && row[csvHeader]) {
            mappedRow[dbField] = row[csvHeader];
          }
        });
        
        return mappedRow;
      });

      setUploadProgress(30);
      
      // Filter out rows that don't have required fields
      const validData = mappedData.filter(row => 
        row.first_name || row.last_name || row.full_name || row.property_address
      );

      if (validData.length === 0) {
        alert('No valid data found. Please ensure you map at least one name field (First Name, Last Name, or Full Name) or Property Address.');
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(50);
      
      // Send to backend
      const { data } = await adminAPI.uploadMappedCSV(validData);
      
      setUploadProgress(90);
      
      // Fetch updated leads
      await fetchLeads();
      
      setUploadProgress(100);
      
      // Set upload status with results
      setUploadStatus({
        success: true,
        newCount: data.newCount || 0,
        updatedCount: data.updatedCount || 0,
        skippedBusinessCount: data.skippedBusinessCount || 0,
        failedCount: data.failedCount || 0,
        totalProcessed: data.totalProcessed || validData.length,
        totalRows: data.totalRows || validData.length,
        message: data.message
      });
      
      // Reset form state after 3 seconds
      setTimeout(() => {
        setShowCSVModal(false);
        setShowMappingStep(false);
        setCsvFile(null);
        setCsvHeaders([]);
        setCsvRows([]);
        setHeaderMapping({});
        setUploadProgress(0);
        setUploadStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to upload CSV:', error);
      setUploadProgress(0);
      setUploadStatus({
        success: false,
        message: error.response?.data?.error || error.message,
        failedCount: csvRows.length
      });
    } finally {
      setUploading(false);
    }
  };

  const resetCSVUpload = () => {
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setHeaderMapping({});
    setShowMappingStep(false);
  };

  const handleDistribute = async () => {
    if (!distributeCount || distributeCount < 1) {
      alert('Please enter a valid number of leads');
      return;
    }
    if (!allUsers && !selectedUser) {
      alert('Please select a user or check "All Users"');
      return;
    }
    try {
      // Call distribute API with selected user or all users and lead count
      const params = {
        leadsCount: distributeCount,
        ...(allUsers ? {} : { userId: selectedUser })
      };
      
      const response = await adminAPI.distributeLeads(params);
      
      setShowDistributeModal(false);
      setSelectedUser('');
      setUserSearch('');
      setShowUserDropdown(false);
      setDistributeCount(1); // Reset count
      
      alert(response.data.message || `Successfully distributed ${distributeCount} lead(s)`);
      fetchLeads(); // Refresh leads list
    } catch (error) {
      console.error('Failed to distribute:', error);
      alert(error.response?.data?.error || 'Failed to distribute leads');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await adminAPI.deleteLead(leadId);
      fetchLeads();
      alert('Lead deleted successfully');
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select leads to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedLeads.length} lead(s)?`)) return;
    
    try {
      await adminAPI.bulkDeleteLeads(selectedLeads);
      setSelectedLeads([]);
      setSelectAll(false);
      fetchLeads();
      alert(`${selectedLeads.length} lead(s) deleted successfully`);
    } catch (error) {
      console.error('Failed to delete leads:', error);
      alert('Failed to delete leads');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allLeadIds = filteredLeads.map(lead => lead.id);
      setSelectedLeads(allLeadIds);
      setSelectAll(true);
    } else {
      setSelectedLeads([]);
      setSelectAll(false);
    }
  };

  const handleSelectLead = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
      setSelectAll(false);
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (lead.full_name && lead.full_name.toLowerCase().includes(query)) ||
      (lead.first_name && lead.first_name.toLowerCase().includes(query)) ||
      (lead.last_name && lead.last_name.toLowerCase().includes(query)) ||
      (lead.owner_name && lead.owner_name.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.toLowerCase().includes(query)) ||
      (lead.property_address && lead.property_address.toLowerCase().includes(query)) ||
      (lead.city && lead.city.toLowerCase().includes(query)) ||
      (lead.state && lead.state.toLowerCase().includes(query)) ||
      (lead.zip_code && lead.zip_code.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Upload and manage leads</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Single Lead</span>
            </button>
            <button
              onClick={() => setShowCSVModal(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Upload className="h-4 w-4" />
              <span>Upload CSV</span>
            </button>
            <button
              onClick={() => setShowDistributeModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <FileText className="h-4 w-4" />
              <span>Distribute Now</span>
            </button>
          </div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads by name, phone, address, city, state, or zip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {selectedLeads.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete {selectedLeads.length} Selected</span>
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 overflow-hidden">
          {/* Pagination Controls */}
          <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredLeads.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {Math.ceil(filteredLeads.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredLeads.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredLeads.length / itemsPerPage)}
                className="px-3 py-1 border dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Sequence #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Owner Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Property Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Mailing Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No leads found. Upload some leads to get started.
                    </td>
                  </tr>
                ) : (
                  filteredLeads
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((lead) => (
                      <tr key={lead.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-semibold dark:text-white">#{lead.sequence_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 dark:text-white">{lead.full_name || lead.owner_name}</div>
                            {lead.is_business && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Business
                              </span>
                            )}
                          </div>
                          {lead.first_name && lead.last_name && !lead.is_business && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {lead.first_name} {lead.last_name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 dark:text-gray-400">{lead.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white">{lead.property_address}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {lead.city}, {lead.state} {lead.zip_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white">{lead.mailing_address}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {lead.mailing_city}, {lead.mailing_state} {lead.mailing_zip}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Single Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Single Lead</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Address *</label>
                  <input
                    type="text"
                    name="property_address"
                    value={formData.property_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Mailing Address (Optional)</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mailing Address</label>
                    <input
                      type="text"
                      name="mailing_address"
                      value={formData.mailing_address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mailing City</label>
                      <input
                        type="text"
                        name="mailing_city"
                        value={formData.mailing_city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mailing State</label>
                      <input
                        type="text"
                        name="mailing_state"
                        value={formData.mailing_state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mailing Zip</label>
                      <input
                        type="text"
                        name="mailing_zip"
                        value={formData.mailing_zip}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload CSV/Excel File</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {!showMappingStep ? 'Step 1: Select your file' : 'Step 2: Map your headers'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowCSVModal(false);
                    resetCSVUpload();
                  }} 
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {!showMappingStep ? (
                // Step 1: File Upload
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <label className="cursor-pointer">
                      <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      CSV or Excel files only
                    </p>
                  </div>

                  {csvFile && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{csvFile.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {csvRows.length} rows found
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={resetCSVUpload}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Note:</strong> After uploading, you'll be able to map your CSV headers to our database fields.
                    </p>
                  </div>
                </div>
              ) : (
                // Step 2: Header Mapping
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>Map your CSV headers to our database fields.</strong> Some fields can be left blank if not available in your CSV.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {csvHeaders.map((header, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            CSV Header
                          </label>
                          <div className="px-3 py-2 bg-white dark:bg-gray-600 border dark:border-gray-500 rounded-lg text-gray-900 dark:text-white font-mono text-sm">
                            {header}
                          </div>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-6" />
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Maps to Database Field
                          </label>
                          <select
                            value={headerMapping[header] || ''}
                            onChange={(e) => handleMappingChange(header, e.target.value)}
                            className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">-- Skip this field --</option>
                            {/* Show currently selected value even if it's mapped */}
                            {headerMapping[header] && (
                              <option value={headerMapping[header]}>
                                {getAvailableDbFields(header).find(f => f.value === headerMapping[header])?.label || 
                                 [
                                   { value: 'first_name', label: 'First Name' },
                                   { value: 'last_name', label: 'Last Name' },
                                   { value: 'full_name', label: 'Full Name' },
                                   { value: 'phone', label: 'Phone Number' },
                                   { value: 'property_address', label: 'Property Address' },
                                   { value: 'city', label: 'Property City' },
                                   { value: 'state', label: 'Property State' },
                                   { value: 'zip_code', label: 'Property Zip' },
                                   { value: 'mailing_address', label: 'Mailing Address' },
                                   { value: 'mailing_city', label: 'Mailing City' },
                                   { value: 'mailing_state', label: 'Mailing State' },
                                   { value: 'mailing_zip', label: 'Mailing Zip' },
                                 ].find(f => f.value === headerMapping[header])?.label
                                }
                              </option>
                            )}
                            {/* Show only available (unmapped) fields */}
                            {getAvailableDbFields(header).map(field => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Preview (First Row)</h4>
                    <div className="text-sm space-y-1">
                      {csvRows.length > 0 && Object.keys(headerMapping).map((csvHeader, idx) => {
                        const dbField = headerMapping[csvHeader];
                        const value = csvRows[0][csvHeader];
                        if (dbField && value) {
                          return (
                            <div key={idx} className="flex">
                              <span className="font-medium text-gray-700 dark:text-gray-300 w-40">{dbField}:</span>
                              <span className="text-gray-600 dark:text-gray-400">{value}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Upload Progress Bar */}
                  {uploading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Uploading...</span>
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Upload Status */}
                  {uploadStatus && (
                    <div className={`${uploadStatus.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-lg p-4`}>
                      <div className="flex items-start">
                        {uploadStatus.success ? (
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="ml-3 flex-1">
                          <h3 className={`text-sm font-medium ${uploadStatus.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                            {uploadStatus.success ? 'Upload Successful!' : 'Upload Failed'}
                          </h3>
                          {uploadStatus.success && (
                            <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                              <ul className="list-disc list-inside space-y-1">
                                <li><strong>{uploadStatus.newCount}</strong> new leads created</li>
                                <li><strong>{uploadStatus.updatedCount}</strong> existing leads updated</li>
                                {uploadStatus.skippedBusinessCount > 0 && (
                                  <li className="text-yellow-600 dark:text-yellow-400"><strong>{uploadStatus.skippedBusinessCount}</strong> businesses skipped (not uploaded)</li>
                                )}
                                {uploadStatus.failedCount > 0 && (
                                  <li className="text-red-600 dark:text-red-400"><strong>{uploadStatus.failedCount}</strong> failed</li>
                                )}
                                <li>Total processed: <strong>{uploadStatus.totalProcessed}</strong> out of <strong>{uploadStatus.totalRows}</strong> rows</li>
                              </ul>
                            </div>
                          )}
                          {!uploadStatus.success && (
                            <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                              {uploadStatus.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setShowMappingStep(false)}
                      disabled={uploading}
                      className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCSVUpload}
                      disabled={uploading}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{uploading ? 'Uploading...' : `Upload ${csvRows.length} Leads`}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Distribute Modal */}
      {showDistributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Distribute Leads</h2>
                <button onClick={() => setShowDistributeModal(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Leads to Distribute
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={distributeCount}
                    onChange={(e) => setDistributeCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter number of leads"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={allUsers}
                      onChange={(e) => {
                        setAllUsers(e.target.checked);
                        if (e.target.checked) setSelectedUser('');
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distribute to All Users</span>
                  </label>

                  {!allUsers && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Wholesaler *
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setShowUserDropdown(true);
                          }}
                          onFocus={() => setShowUserDropdown(true)}
                          onClick={() => setShowUserDropdown(true)}
                          placeholder="Click to select or search wholesalers..."
                          className="w-full pl-10 pr-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
                        />
                      </div>
                      {showUserDropdown && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowUserDropdown(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {users
                              .filter((u) =>
                                !userSearch || 
                                u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                                u.email.toLowerCase().includes(userSearch.toLowerCase())
                              )
                              .map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedUser(user.id);
                                    setUserSearch(user.name);
                                    setShowUserDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col ${
                                    selectedUser === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                  }`}
                                >
                                  <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {user.plan_type.toUpperCase()} - {user.lead_count || 0} leads
                                  </span>
                                </button>
                              ))}
                            {users.filter((u) =>
                              !userSearch || 
                              u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                              u.email.toLowerCase().includes(userSearch.toLowerCase())
                            ).length === 0 && (
                              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                No wholesalers found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {allUsers && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
                      Leads will be distributed to all active wholesalers
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDistributeModal(false)}
                    className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDistribute}
                    className="px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600"
                  >
                    Distribute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
