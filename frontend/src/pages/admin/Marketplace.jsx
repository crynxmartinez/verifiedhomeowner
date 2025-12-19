import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Upload, Plus, Trash2, Search, Loader2, Download, Edit2, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const TEMPERATURES = [
  { value: 'hot', label: '🔥 Hot ($100)', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', price: 100 },
  { value: 'warm', label: '🌡️ Warm ($80)', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', price: 80 },
];

const MOTIVATIONS = [
  'Code Violation',
  'Divorce',
  'Foreclosure',
  'Probate',
  'Tax Lien',
  'Vacant Property',
  'Inherited Property',
  'Behind on Payments',
  'Downsizing',
  'Relocation',
  'Job Loss',
  'Medical Bills',
  'Other'
];

const TIMELINES = [
  'ASAP (0-30 days)',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '12+ months',
  'Flexible'
];

export default function Marketplace() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadCSV, setShowUploadCSV] = useState(false);
  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    property_address: '',
    city: '',
    state: '',
    zip_code: '',
    mailing_address: '',
    mailing_city: '',
    mailing_state: '',
    mailing_zip: '',
    motivation: MOTIVATIONS[0],
    timeline: TIMELINES[0],
    asking_price: '',
    temperature: 'warm',
    max_buyers: '0',
  });
  const [csvFile, setCsvFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMarketplaceLeads();
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Failed to fetch marketplace leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    return (
      lead.owner_name?.toLowerCase().includes(query) ||
      lead.property_address?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.city?.toLowerCase().includes(query) ||
      lead.state?.toLowerCase().includes(query) ||
      lead.zip_code?.toLowerCase().includes(query)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const leadData = {
        ...formData,
        price: parseFloat(formData.price),
        max_buyers: parseInt(formData.max_buyers),
      };
      
      await adminAPI.createMarketplaceLead(leadData);
      setShowAddForm(false);
      setFormData({
        owner_name: '',
        phone: '',
        property_address: '',
        city: '',
        state: '',
        zip_code: '',
        mailing_address: '',
        mailing_city: '',
        mailing_state: '',
        mailing_zip: '',
        motivation: MOTIVATIONS[0],
        timeline: TIMELINES[0],
        asking_price: '',
        temperature: 'warm',
        price: '',
        max_buyers: '0',
      });
      fetchLeads();
    } catch (error) {
      console.error('Failed to create marketplace lead:', error);
      toast.error('Failed to create lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead({
      id: lead.id,
      owner_name: lead.owner_name || '',
      phone: lead.phone || '',
      property_address: lead.property_address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip_code: lead.zip_code || '',
      mailing_address: lead.mailing_address || '',
      mailing_city: lead.mailing_city || '',
      mailing_state: lead.mailing_state || '',
      mailing_zip: lead.mailing_zip || '',
      motivation: lead.motivation || MOTIVATIONS[0],
      timeline: lead.timeline || TIMELINES[0],
      asking_price: lead.asking_price || '',
      temperature: lead.temperature || 'warm',
      price: lead.price || '',
      max_buyers: lead.max_buyers || 0,
      is_hidden: lead.is_hidden || false,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingLead(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingLead) return;
    setSaving(true);
    try {
      await adminAPI.updateMarketplaceLead({
        id: editingLead.id,
        owner_name: editingLead.owner_name,
        phone: editingLead.phone,
        property_address: editingLead.property_address,
        city: editingLead.city,
        state: editingLead.state,
        zip_code: editingLead.zip_code,
        mailing_address: editingLead.mailing_address,
        mailing_city: editingLead.mailing_city,
        mailing_state: editingLead.mailing_state,
        mailing_zip: editingLead.mailing_zip,
        motivation: editingLead.motivation,
        timeline: editingLead.timeline,
        asking_price: editingLead.asking_price,
        temperature: editingLead.temperature,
        price: parseFloat(editingLead.price),
        max_buyers: parseInt(editingLead.max_buyers),
        is_hidden: editingLead.is_hidden,
      });
      toast.success('Lead updated successfully');
      setShowEditModal(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHidden = async (lead) => {
    try {
      await adminAPI.updateMarketplaceLead({
        id: lead.id,
        is_hidden: !lead.is_hidden,
      });
      toast.success(lead.is_hidden ? 'Lead is now visible' : 'Lead is now hidden');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update lead visibility');
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target.result;
        const response = await adminAPI.uploadMarketplaceCSV(csvData);
        setUploadMessage(response.data.message);
        setCsvFile(null);
        setShowUploadCSV(false);
        fetchLeads();
        setTimeout(() => setUploadMessage(''), 5000);
      };
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Failed to upload CSV:', error);
      toast.error('Failed to upload CSV');
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm('Are you sure you want to delete this marketplace lead?')) {
      return;
    }

    try {
      await adminAPI.deleteMarketplaceLead(leadId);
      fetchLeads();
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading marketplace leads...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Marketplace</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Single Lead
          </button>
          <button
            onClick={() => setShowUploadCSV(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload size={20} />
            Upload CSV
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg">
          {uploadMessage}
        </div>
      )}

      {/* Add Single Lead Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Add Marketplace Lead</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Property Address *
                </label>
                <input
                  type="text"
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Motivation *
                  </label>
                  <select
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {MOTIVATIONS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Timeline *
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TIMELINES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asking Price ($)
                  </label>
                  <input
                    type="number"
                    name="asking_price"
                    value={formData.asking_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="Property asking price"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lead Temperature
                  </label>
                  <select
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TEMPERATURES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Buyers (0 = unlimited)
                </label>
                <input
                  type="number"
                  name="max_buyers"
                  value={formData.max_buyers}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadCSV && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Upload Marketplace Leads CSV</h2>
            
            {/* Download Template */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Need a template?</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">Download our CSV template with sample data</p>
                </div>
                <a
                  href="/templates/marketplace-leads-template.csv"
                  download="marketplace-leads-template.csv"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  <Download size={16} />
                  Template
                </a>
              </div>
            </div>

            <form onSubmit={handleCSVUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Required columns: owner_name, phone, property_address, city, state, zip_code, motivation, timeline, price, max_buyers
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadCSV(false);
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by owner name, address, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Temp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Motivation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Asking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No leads match your search' : 'No marketplace leads yet. Add your first lead!'}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const tempConfig = TEMPERATURES.find(t => t.value === lead.temperature) || TEMPERATURES[1];
                const isSoldOut = lead.max_buyers > 0 && lead.times_sold >= lead.max_buyers;
                return (
                <tr key={lead.id} className={lead.is_hidden ? 'opacity-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(lead)}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-left"
                    >
                      {lead.property_address}
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.city}, {lead.state} {lead.zip_code}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {lead.owner_name} • {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${tempConfig.color}`}>
                      {tempConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div>{lead.motivation}</div>
                    <div className="text-xs text-gray-500">{lead.timeline}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {lead.asking_price ? `$${parseFloat(lead.asking_price).toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    ${tempConfig.price || 80}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {lead.times_sold}/{lead.max_buyers === 0 ? '∞' : lead.max_buyers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {lead.is_hidden ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Hidden
                      </span>
                    ) : isSoldOut ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Sold Out
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Edit lead"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleHidden(lead)}
                        className={`${lead.is_hidden ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'} hover:text-gray-900 dark:hover:text-gray-300`}
                        title={lead.is_hidden ? 'Show lead' : 'Hide lead'}
                      >
                        {lead.is_hidden ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete lead"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">Edit Marketplace Lead</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    name="owner_name"
                    value={editingLead.owner_name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editingLead.phone}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Address</label>
                <input
                  type="text"
                  name="property_address"
                  value={editingLead.property_address}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editingLead.city}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={editingLead.state}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={editingLead.zip_code}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivation</label>
                  <select
                    name="motivation"
                    value={editingLead.motivation}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {MOTIVATIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeline</label>
                  <select
                    name="timeline"
                    value={editingLead.timeline}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asking Price ($)</label>
                  <input
                    type="number"
                    name="asking_price"
                    value={editingLead.asking_price}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Temperature</label>
                  <select
                    name="temperature"
                    value={editingLead.temperature}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {TEMPERATURES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Buyers</label>
                <input
                  type="number"
                  name="max_buyers"
                  value={editingLead.max_buyers}
                  onChange={handleEditChange}
                  min="0"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_hidden"
                  id="is_hidden"
                  checked={editingLead.is_hidden}
                  onChange={handleEditChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_hidden" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hide from marketplace (lead won't be visible to wholesalers)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}
