import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  Clock, 
  FileText, 
  Activity, 
  Zap,
  Copy, 
  Check, 
  ExternalLink,
  Calendar,
  MessageSquare,
  ChevronRight,
  Loader2,
  Save,
  Flame,
  Thermometer
} from 'lucide-react';
import { leadsAPI } from '../lib/api';
import { useToast } from '../context/ToastContext';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
  { id: 'actions', label: 'Actions', icon: Zap },
];

export default function LeadDetailModal({ lead, userLead, onClose, onUpdate }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(userLead?.notes || '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Generate display name
  const displayName = lead?.owner_name || lead?.full_name || 
    `${lead?.first_name || ''} ${lead?.last_name || ''}`.trim() || 'Unknown';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Copy to clipboard
  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await leadsAPI.updateLead(userLead.id, userLead.source, { notes });
      onUpdate?.({ ...userLead, notes });
      toast.success('Notes saved');
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  // Update status
  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      let action = 'call_now';
      if (newStatus === 'follow_up' || newStatus === 'not_interested' || newStatus === 'pending') {
        action = 'pending';
      }
      
      await leadsAPI.updateLead(userLead.id, userLead.source, { 
        status: newStatus,
        action: action
      });
      onUpdate?.({ ...userLead, status: newStatus, action });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  // Generate activity logs from userLead data
  useEffect(() => {
    const logs = [];
    
    // Lead assigned/purchased
    if (userLead?.assigned_at) {
      logs.push({
        id: 'assigned',
        type: userLead.source === 'purchased' ? 'purchased' : 'assigned',
        message: userLead.source === 'purchased' ? 'Lead purchased from marketplace' : 'Lead assigned to you',
        timestamp: userLead.assigned_at,
      });
    }

    // Last called
    if (userLead?.last_called_at) {
      logs.push({
        id: 'called',
        type: 'called',
        message: 'Lead was called',
        timestamp: userLead.last_called_at,
      });
    }

    // Status changes (we'll show current status)
    if (userLead?.status && userLead.status !== 'new') {
      logs.push({
        id: 'status',
        type: 'status',
        message: `Status changed to "${userLead.status.replace('_', ' ')}"`,
        timestamp: userLead.updated_at,
      });
    }

    // Follow-up date
    if (userLead?.follow_up_date) {
      logs.push({
        id: 'followup',
        type: 'followup',
        message: `Follow-up scheduled`,
        timestamp: userLead.follow_up_date,
      });
    }

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setActivityLogs(logs);
  }, [userLead]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'not_interested': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Get temperature badge
  const getTemperatureBadge = () => {
    const timeline = lead?.timeline?.toLowerCase();
    if (timeline === 'asap' || timeline === 'immediate' || timeline === '1-2 weeks') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-full text-xs font-medium">
          <Flame className="h-3 w-3" />
          Hot Lead
        </span>
      );
    }
    if (timeline) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded-full text-xs font-medium">
          <Thermometer className="h-3 w-3" />
          Warm Lead
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(userLead?.status)}`}>
                  {userLead?.status?.replace('_', ' ') || 'New'}
                </span>
                {getTemperatureBadge()}
                {userLead?.source === 'purchased' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded text-xs font-medium">
                    Purchased
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700 px-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Contact Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{displayName}</span>
                    </div>
                  </div>
                  
                  {lead?.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${lead.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {lead.phone}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(lead.phone, 'phone')}
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        {copied === 'phone' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}

                  {lead?.email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${lead.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {lead.email}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(lead.email, 'email')}
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        {copied === 'email' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Property Address
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Home className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-900 dark:text-white">{lead?.property_address || '—'}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {lead?.city}, {lead?.state} {lead?.zip_code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(`${lead?.property_address}, ${lead?.city}, ${lead?.state} ${lead?.zip_code}`, 'property')}
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Copy address"
                      >
                        {copied === 'property' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <a
                        href={`https://www.zillow.com/homes/${encodeURIComponent(`${lead?.property_address}, ${lead?.city}, ${lead?.state} ${lead?.zip_code}`.replace(/\s+/g, '-'))}_rb/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="View on Zillow"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mailing Address (if different) */}
              {lead?.mailing_address && lead.mailing_address !== lead.property_address && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Mailing Address
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-900 dark:text-white">{lead.mailing_address}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {lead.mailing_city}, {lead.mailing_state} {lead.mailing_zip}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(`${lead.mailing_address}, ${lead.mailing_city}, ${lead.mailing_state} ${lead.mailing_zip}`, 'mailing')}
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        {copied === 'mailing' ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Motivation */}
              {lead?.motivation && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Motivation
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">{lead.motivation}</p>
                    {lead?.timeline && (
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                        <strong>Timeline:</strong> {lead.timeline}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Lead Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Lead Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">
                      {userLead?.source || 'Subscription'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Received</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatRelativeTime(userLead?.assigned_at)}
                    </p>
                  </div>
                  {userLead?.countdown_days > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Countdown</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {userLead.countdown_days} days
                      </p>
                    </div>
                  )}
                  {userLead?.price_paid && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Price Paid</p>
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        ${userLead.price_paid}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Activity Log
              </h3>
              
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        log.type === 'purchased' ? 'bg-green-100 dark:bg-green-900' :
                        log.type === 'assigned' ? 'bg-blue-100 dark:bg-blue-900' :
                        log.type === 'called' ? 'bg-purple-100 dark:bg-purple-900' :
                        log.type === 'status' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {log.type === 'purchased' && <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        {log.type === 'assigned' && <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {log.type === 'called' && <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
                        {log.type === 'status' && <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                        {log.type === 'followup' && <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white text-sm">{log.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Notes
              </h3>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                className="w-full h-48 border dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Quick Templates */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {['Left voicemail', 'No answer', 'Scheduled callback', 'Sent text', 'Wrong number'].map((template) => (
                    <button
                      key={template}
                      onClick={() => setNotes(prev => prev ? `${prev}\n• ${template} - ${new Date().toLocaleDateString()}` : `• ${template} - ${new Date().toLocaleDateString()}`)}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={saving || notes === (userLead?.notes || '')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Notes
                </button>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Quick Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Update Status
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusChange('new')}
                    disabled={saving || userLead?.status === 'new'}
                    className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                      userLead?.status === 'new'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-500 text-gray-700 dark:text-gray-300'
                    } disabled:opacity-50`}
                  >
                    <FileText className="h-4 w-4" />
                    New
                  </button>
                  <button
                    onClick={() => handleStatusChange('follow_up')}
                    disabled={saving || userLead?.status === 'follow_up'}
                    className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                      userLead?.status === 'follow_up'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-yellow-500 text-gray-700 dark:text-gray-300'
                    } disabled:opacity-50`}
                  >
                    <Clock className="h-4 w-4" />
                    Follow-up
                  </button>
                  <button
                    onClick={() => handleStatusChange('not_interested')}
                    disabled={saving || userLead?.status === 'not_interested'}
                    className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                      userLead?.status === 'not_interested'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-red-500 text-gray-700 dark:text-gray-300'
                    } disabled:opacity-50`}
                  >
                    <X className="h-4 w-4" />
                    Not Interested
                  </button>
                  <button
                    onClick={() => handleStatusChange('pending')}
                    disabled={saving || userLead?.status === 'pending'}
                    className={`p-3 rounded-lg border-2 transition flex items-center justify-center gap-2 ${
                      userLead?.status === 'pending'
                        ? 'border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    } disabled:opacity-50`}
                  >
                    <Clock className="h-4 w-4" />
                    Pending
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <a
                    href={`tel:${lead?.phone}`}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-700 dark:text-green-300 font-medium">Call Now</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </a>

                  <button
                    onClick={() => handleCopy(lead?.phone, 'phone-action')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Copy Phone Number</span>
                    </div>
                    {copied === 'phone-action' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleCopy(`${lead?.property_address}, ${lead?.city}, ${lead?.state} ${lead?.zip_code}`, 'address-action')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Copy Address</span>
                    </div>
                    {copied === 'address-action' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  <a
                    href={`https://www.zillow.com/homes/${encodeURIComponent(`${lead?.property_address}, ${lead?.city}, ${lead?.state} ${lead?.zip_code}`.replace(/\s+/g, '-'))}_rb/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">View on Zillow</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
