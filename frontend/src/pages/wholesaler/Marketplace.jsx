import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { marketplaceAPI } from '../../lib/api';
import { Filter, DollarSign } from 'lucide-react';

const MOTIVATIONS = [
  'All',
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
  'All',
  'ASAP (0-30 days)',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '12+ months',
  'Flexible'
];

const US_STATES = [
  'All', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function Marketplace() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    motivation: 'All',
    timeline: 'All',
    state: 'All',
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.motivation !== 'All') params.motivation = filters.motivation;
      if (filters.timeline !== 'All') params.timeline = filters.timeline;
      if (filters.state !== 'All') params.state = filters.state;

      const response = await marketplaceAPI.getLeads(params);
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Failed to fetch marketplace leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePurchase = async () => {
    if (!selectedLead) return;

    try {
      setPurchasing(true);
      await marketplaceAPI.purchaseLead(selectedLead.id);
      alert('Lead purchased successfully! Check "My Leads" to view it.');
      setSelectedLead(null);
      fetchLeads(); // Refresh to remove purchased lead
    } catch (error) {
      console.error('Failed to purchase lead:', error);
      alert(error.response?.data?.error || 'Failed to purchase lead');
    } finally {
      setPurchasing(false);
    }
  };

  const maskAddress = (address) => {
    if (!address) return '*****';
    const parts = address.split(' ');
    return parts.map((part, i) => i === 0 ? '*****' : part).join(' ');
  };

  const maskName = (name) => {
    if (!name) return '*****';
    const parts = name.split(' ');
    return parts.map((part, i) => 
      i === 0 ? part.charAt(0) + '****' : part.charAt(0) + '****'
    ).join(' ');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lead Marketplace</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={16} />
            <span>Pay-Per-Lead</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <span className="font-medium text-gray-900">Filters</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivation
              </label>
              <select
                value={filters.motivation}
                onChange={(e) => handleFilterChange('motivation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {MOTIVATIONS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline
              </label>
              <select
                value={filters.timeline}
                onChange={(e) => handleFilterChange('timeline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {TIMELINES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {US_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading leads...</div>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No leads available with current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="text-center space-y-2">
                  <div className="text-2xl">💰</div>
                  <div className="text-sm font-medium text-gray-900">
                    {maskName(lead.owner_name)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {maskAddress(lead.property_address)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {lead.state}, {lead.zip_code}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-gray-500">Motivation:</div>
                    <div className="text-xs font-medium text-gray-900">{lead.motivation}</div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="text-xs text-gray-500">Timeline:</div>
                    <div className="text-xs font-medium text-gray-900">{lead.timeline}</div>
                  </div>
                  <button className="w-full mt-3 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                    Buy - ${parseFloat(lead.price).toFixed(2)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Purchase Lead</h2>
              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-gray-600">Address:</span>
                  <div className="font-medium">{selectedLead.property_address}</div>
                  <div className="text-sm text-gray-600">
                    {selectedLead.city}, {selectedLead.state} {selectedLead.zip_code}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Motivation:</span>
                  <div className="font-medium">{selectedLead.motivation}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Timeline:</span>
                  <div className="font-medium">{selectedLead.timeline}</div>
                </div>
                <div className="border-t pt-3">
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="text-2xl font-bold text-green-600">
                    ${parseFloat(selectedLead.price).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  disabled={purchasing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {purchasing ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
