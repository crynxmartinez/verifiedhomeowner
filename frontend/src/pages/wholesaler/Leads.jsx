import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leadsAPI } from '../../lib/api';
import { Phone, Clock, Edit2, Save, X, DollarSign, Package } from 'lucide-react';

export default function WholesalerLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await leadsAPI.getLeads();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lead) => {
    setEditingId(lead.id);
    setEditData({
      status: lead.status,
      action: lead.action,
      notes: lead.notes || '',
      follow_up_date: lead.follow_up_date || '',
      countdown_days: lead.countdown_days || null,
    });
  };

  const handleSave = async (leadId, source) => {
    try {
      await leadsAPI.updateLead(leadId, source, editData);
      setEditingId(null);
      fetchLeads();
    } catch (error) {
      console.error('Failed to update lead:', error);
      alert('Failed to update lead');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const callNowLeads = leads.filter((l) => l.action === 'call_now' || l.status === 'new' || l.status === 'pending');
  const pendingLeads = leads.filter((l) => l.action === 'pending' && l.status !== 'new' && l.status !== 'pending');

  const getSourceIcon = (source) => {
    if (source === 'purchased') {
      return <DollarSign size={16} className="text-green-600" title="Purchased Lead" />;
    }
    return <Package size={16} className="text-blue-600" title="Subscription Lead" />;
  };

  const getCountdownDisplay = (lead) => {
    if (!lead.countdown_days || lead.countdown_days <= 0) return null;
    const action = lead.status === 'follow_up' ? 'Follow up' : 'Archive';
    return `${action} in ${lead.countdown_days} day${lead.countdown_days > 1 ? 's' : ''}`;
  };

  const renderLeadRow = (userLead) => {
    const lead = userLead.lead;
    const isEditing = editingId === userLead.id;
    const countdownDisplay = getCountdownDisplay(userLead);

    return (
      <tr key={userLead.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {getSourceIcon(userLead.source)}
            <div>
              <div className="font-medium dark:text-white">{lead.owner_name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{lead.phone}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="dark:text-white">{lead.property_address}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lead.city}, {lead.state} {lead.zip_code}
          </div>
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <select
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="new">New</option>
              <option value="called">Called</option>
              <option value="follow_up">Follow-up</option>
              <option value="not_interested">Not Interested</option>
              <option value="pending">Pending</option>
            </select>
          ) : (
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                userLead.status === 'new'
                  ? 'bg-blue-100 text-blue-800'
                  : userLead.status === 'called'
                  ? 'bg-green-100 text-green-800'
                  : userLead.status === 'follow_up'
                  ? 'bg-yellow-100 text-yellow-800'
                  : userLead.status === 'pending'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {userLead.status.replace('_', ' ')}
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="space-y-2">
              <select
                value={editData.action}
                onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                className="border dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="call_now">Call Now</option>
                <option value="pending">Pending</option>
              </select>
              {(editData.status === 'follow_up' || editData.status === 'not_interested') && (
                <select
                  value={editData.countdown_days || ''}
                  onChange={(e) => setEditData({ ...editData, countdown_days: parseInt(e.target.value) })}
                  className="border dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Set countdown...</option>
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              )}
            </div>
          ) : (
            <div>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  userLead.action === 'call_now'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {userLead.action.replace('_', ' ')}
              </span>
              {countdownDisplay && (
                <div className="text-xs text-orange-600 mt-1 font-medium">
                  {countdownDisplay}
                </div>
              )}
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="text-sm dark:text-white">
            {lead.motivation || '-'}
          </div>
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              className="border dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="2"
              placeholder="Add notes..."
            />
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">{userLead.notes || '-'}</span>
          )}
        </td>
        <td className="px-4 py-3">
          {isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave(userLead.id, userLead.source)}
                className="text-green-600 hover:text-green-800"
              >
                <Save className="h-4 w-4" />
              </button>
              <button onClick={handleCancel} className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit(userLead)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading leads...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Leads</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track your leads</p>
        </div>

        {/* Call Now Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900">
          <div className="px-6 py-4 border-b dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Call Now ({callNowLeads.length})
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">These leads need to be called</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Motivation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {callNowLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No leads to call right now
                    </td>
                  </tr>
                ) : (
                  callNowLeads.map(renderLeadRow)
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900">
          <div className="px-6 py-4 border-b dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Pending ({pendingLeads.length})
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Follow-ups and other pending leads</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Motivation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingLeads.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No pending leads
                    </td>
                  </tr>
                ) : (
                  pendingLeads.map(renderLeadRow)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
