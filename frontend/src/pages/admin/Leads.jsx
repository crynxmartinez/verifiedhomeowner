import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Upload, Plus, X, FileText } from 'lucide-react';

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
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
  });
  const [csvData, setCSVData] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

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

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvData.trim()) {
      alert('Please paste CSV data');
      return;
    }
    setUploading(true);
    try {
      const { data } = await adminAPI.uploadCSV(csvData);
      setShowCSVModal(false);
      setCSVData('');
      fetchLeads();
      alert(data.message || 'Leads uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload CSV:', error);
      alert('Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleDistribute = async () => {
    if (!confirm('Manually distribute leads to all active wholesalers?')) return;
    try {
      const { data } = await adminAPI.distributeLeads();
      alert(data.message);
    } catch (error) {
      console.error('Failed to distribute:', error);
      alert('Failed to distribute leads');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-2">Upload and manage leads</p>
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
              onClick={handleDistribute}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <FileText className="h-4 w-4" />
              <span>Distribute Now</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sequence #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Owner Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Property Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    City, State
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No leads found. Upload some leads to get started.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold">#{lead.sequence_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{lead.owner_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{lead.property_address}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">
                          {lead.city}, {lead.state} {lead.zip_code}
                        </div>
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Single Lead</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Address *</label>
                  <input
                    type="text"
                    name="property_address"
                    value={formData.property_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Mailing Address (Optional)</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Address</label>
                    <input
                      type="text"
                      name="mailing_address"
                      value={formData.mailing_address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mailing City</label>
                      <input
                        type="text"
                        name="mailing_city"
                        value={formData.mailing_city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mailing State</label>
                      <input
                        type="text"
                        name="mailing_state"
                        value={formData.mailing_state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mailing Zip</label>
                      <input
                        type="text"
                        name="mailing_zip"
                        value={formData.mailing_zip}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload CSV</h2>
                <button onClick={() => setShowCSVModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCSVUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste CSV Data
                  </label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCSVData(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    rows="10"
                    placeholder="full_name,phone,address,city,state,zip,mailing_address,mailing_city,mailing_state,mailing_zip&#10;John Doe,555-1234,123 Main St,City,CA,12345,,,,"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>CSV Format:</strong> Include headers: full_name, phone, address, city, state, zip, mailing_address, mailing_city, mailing_state, mailing_zip
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCSVModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
