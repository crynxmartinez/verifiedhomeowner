import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leadsAPI } from '../../lib/api';
import { Phone, Clock, DollarSign, Package } from 'lucide-react';

export default function WholesalerLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLeads, setSavingLeads] = useState(new Set());
  const [notesDebounce, setNotesDebounce] = useState({});

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

  const handleStatusChange = async (leadId, source, newStatus) => {
    setSavingLeads(prev => new Set(prev).add(leadId));
    try {
      await leadsAPI.updateLead(leadId, source, { status: newStatus });
      await fetchLeads(); // Refresh to get updated data
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setSavingLeads(prev => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  const handleNotesChange = (leadId, source, newNotes) => {
    // Clear existing timeout for this lead
    if (notesDebounce[leadId]) {
      clearTimeout(notesDebounce[leadId]);
    }

    // Set new timeout (auto-save after 1 second of no typing)
    const timeoutId = setTimeout(async () => {
      setSavingLeads(prev => new Set(prev).add(leadId));
      try {
        await leadsAPI.updateLead(leadId, source, { notes: newNotes });
        // Update local state immediately for better UX
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === leadId ? { ...lead, notes: newNotes } : lead
          )
        );
      } catch (error) {
        console.error('Failed to update notes:', error);
        alert('Failed to update notes');
      } finally {
        setSavingLeads(prev => {
          const next = new Set(prev);
          next.delete(leadId);
          return next;
        });
      }
    }, 1000);

    setNotesDebounce(prev => ({ ...prev, [leadId]: timeoutId }));
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
    const countdownDisplay = getCountdownDisplay(userLead);
    const isSaving = savingLeads.has(userLead.id);

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
          <select
            value={userLead.status}
            onChange={(e) => handleStatusChange(userLead.id, userLead.source, e.target.value)}
            disabled={isSaving}
            className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="new">New</option>
            <option value="called">Called</option>
            <option value="follow_up">Follow-up</option>
            <option value="not_interested">Not Interested</option>
            <option value="pending">Pending</option>
          </select>
          {isSaving && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Saving...</div>
          )}
        </td>
        <td className="px-4 py-3">
          <div>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                userLead.action === 'call_now'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {userLead.action.replace('_', ' ')}
            </span>
            {countdownDisplay && (
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                {countdownDisplay}
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="text-sm dark:text-white">
            {lead.motivation || '-'}
          </div>
        </td>
        <td className="px-4 py-3">
          <textarea
            value={userLead.notes || ''}
            onChange={(e) => handleNotesChange(userLead.id, userLead.source, e.target.value)}
            disabled={isSaving}
            className="border dark:border-gray-600 rounded px-2 py-1 text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 resize-none hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows="2"
            placeholder="Add notes..."
          />
          {isSaving && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Saving...</div>
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
                </tr>
              </thead>
              <tbody>
                {callNowLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
                </tr>
              </thead>
              <tbody>
                {pendingLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
