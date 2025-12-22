import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { leadsAPI } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { Phone, Clock, DollarSign, Package, Copy, Check, X, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Download, Loader2, Eye, Lock } from 'lucide-react';
import TagInput from '../../components/TagInput';
import FilterPanel from '../../components/FilterPanel';
import LeadDetailModal from '../../components/LeadDetailModal';
import { useToast } from '../../context/ToastContext';
import { SkeletonLeadCard } from '../../components/Skeleton';

export default function WholesalerLeads() {
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const isProPlan = user?.plan_type === 'pro';
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLeads, setSavingLeads] = useState(new Set());
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null); // For lead detail modal

  // Pagination state for Call Now board
  const [callNowPage, setCallNowPage] = useState(1);
  const [callNowPageSize, setCallNowPageSize] = useState(10);

  // Pagination state for Pending board
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    source: 'all',        // all, subscription, purchased
    city: 'all',          // all, or specific city
    tag: 'all',           // all, or specific tag
    pendingStatus: 'all', // all, follow_up, not_interested, pending
    countdownDays: 'all', // all, or number
    countdownCompare: 'gte' // eq (equals), gte (more than or equal), lte (less than or equal)
  });
  const [tempFilters, setTempFilters] = useState({ ...filters }); // For Apply button

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

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await leadsAPI.exportCSV(filters.source !== 'all' ? filters.source : null);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export leads:', error);
      toast.error('Failed to export leads');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (leadId, source, newStatus) => {
    setSavingLeads(prev => new Set(prev).add(leadId));
    try {
      // Determine action based on status
      let action = 'call_now';
      if (newStatus === 'follow_up' || newStatus === 'not_interested' || newStatus === 'pending') {
        action = 'pending';
      }
      
      await leadsAPI.updateLead(leadId, source, { 
        status: newStatus,
        action: action
      });
      await fetchLeads(); // Refresh to get updated data
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setSavingLeads(prev => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  const handleCountdownChange = async (leadId, source, countdownDays) => {
    setSavingLeads(prev => new Set(prev).add(leadId));
    try {
      await leadsAPI.updateLead(leadId, source, { countdown_days: parseInt(countdownDays) || null });
      await fetchLeads(); // Refresh to get updated data
    } catch (error) {
      console.error('Failed to update countdown:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed to update countdown: ${error.response?.data?.details || error.message}`);
    } finally {
      setSavingLeads(prev => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  const handleTagsChange = async (leadId, source, newTags) => {
    // Update local state immediately for instant feedback
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, tags: newTags } : lead
      )
    );

    // Save to server
    setSavingLeads(prev => new Set(prev).add(leadId));
    try {
      await leadsAPI.updateLead(leadId, source, { tags: newTags });
    } catch (error) {
      console.error('Failed to update tags:', error);
      // Revert on error
      await fetchLeads();
    } finally {
      setSavingLeads(prev => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  // Filter function - applies search and filters
  const applyFilters = (leadsToFilter) => {
    let filtered = [...leadsToFilter];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((l) => {
        const lead = l.lead || {};
        return (
          (lead.owner_name || '').toLowerCase().includes(search) ||
          (lead.full_name || '').toLowerCase().includes(search) ||
          (lead.phone || '').toLowerCase().includes(search) ||
          (lead.property_address || '').toLowerCase().includes(search) ||
          (lead.city || '').toLowerCase().includes(search) ||
          (lead.state || '').toLowerCase().includes(search) ||
          (lead.zip_code || '').toLowerCase().includes(search)
        );
      });
    }

    // Source filter
    if (filters.source !== 'all') {
      filtered = filtered.filter((l) => l.source === filters.source);
    }

    // City filter
    if (filters.city !== 'all') {
      filtered = filtered.filter((l) => l.lead?.city === filters.city);
    }

    // Tag filter
    if (filters.tag !== 'all') {
      filtered = filtered.filter((l) => (l.tags || []).includes(filters.tag));
    }

    // Countdown days filter
    if (filters.countdownDays !== 'all') {
      const targetDays = parseInt(filters.countdownDays);
      filtered = filtered.filter((l) => {
        const days = l.countdown_days || 0;
        switch (filters.countdownCompare) {
          case 'eq': return days === targetDays;
          case 'lte': return days <= targetDays;
          case 'gte': 
          default: return days >= targetDays;
        }
      });
    }

    return filtered;
  };

  // Apply global filters first
  const filteredLeads = applyFilters(leads);

  // Pending leads: follow-up, not interested, or pending status
  let pendingLeads = filteredLeads.filter((l) => 
    l.status === 'follow_up' || 
    l.status === 'not_interested' || 
    l.status === 'pending'
  );

  // Apply pending status filter (only for pending board)
  if (filters.pendingStatus !== 'all') {
    pendingLeads = pendingLeads.filter((l) => l.status === filters.pendingStatus);
  }
  
  // Call Now leads: new or call_now action (but NOT if in pending)
  const callNowLeads = filteredLeads.filter((l) => {
    // Exclude if already in pending
    if (l.status === 'follow_up' || l.status === 'not_interested' || l.status === 'pending') {
      return false;
    }
    // Include if new or call_now action
    return l.status === 'new' || l.action === 'call_now';
  });

  // Pagination calculations for Call Now
  const callNowTotalPages = Math.ceil(callNowLeads.length / callNowPageSize);
  const callNowStartIndex = (callNowPage - 1) * callNowPageSize;
  const callNowPaginatedLeads = callNowLeads.slice(callNowStartIndex, callNowStartIndex + callNowPageSize);

  // Pagination calculations for Pending
  const pendingTotalPages = Math.ceil(pendingLeads.length / pendingPageSize);
  const pendingStartIndex = (pendingPage - 1) * pendingPageSize;
  const pendingPaginatedLeads = pendingLeads.slice(pendingStartIndex, pendingStartIndex + pendingPageSize);

  // Reset to page 1 when page size changes
  const handleCallNowPageSizeChange = (newSize) => {
    setCallNowPageSize(newSize);
    setCallNowPage(1);
  };

  const handlePendingPageSizeChange = (newSize) => {
    setPendingPageSize(newSize);
    setPendingPage(1);
  };

  const getSourceIcon = (source) => {
    if (source === 'purchased') {
      return <DollarSign size={16} className="text-green-600" title="Purchased Lead" />;
    }
    return <Package size={16} className="text-blue-600" title="Subscription Lead" />;
  };

  const handleCopyPhone = async (phone, leadId) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(leadId);
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Pagination Component
  const PaginationControls = ({ currentPage, totalPages, totalItems, pageSize, onPageChange, onPageSizeChange, startIndex }) => {
    if (totalItems === 0) return null;
    
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {startIndex + 1}-{endIndex} of {totalItems}
        </div>
        <div className="flex items-center gap-3">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          
          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded border dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Card View
  const renderLeadCard = (userLead) => {
    const lead = userLead.lead;
    const isSaving = savingLeads.has(userLead.id);
    const displayName = lead.owner_name || lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown';

    return (
      <div key={userLead.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer flex-1"
            onClick={() => setSelectedLead(userLead)}
          >
            {getSourceIcon(userLead.source)}
            <div>
              <div className="font-medium dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{displayName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{lead.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLead(userLead)}
              className="p-1.5 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
              title="View details"
            >
              <Eye size={14} className="text-blue-600 dark:text-blue-400" />
            </button>
            <select
              value={userLead.status}
              onChange={(e) => handleStatusChange(userLead.id, userLead.source, e.target.value)}
              disabled={isSaving}
              className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="new">New</option>
              <option value="follow_up">Follow-up</option>
              <option value="not_interested">Not Interested</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Property */}
        <div className="text-sm" onClick={() => setSelectedLead(userLead)} style={{ cursor: 'pointer' }}>
          <div className="text-gray-500 dark:text-gray-400">Property</div>
          <div className="dark:text-white">{lead.property_address}</div>
          <div className="text-gray-500 dark:text-gray-400">{lead.city}, {lead.state} {lead.zip_code}</div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900 rounded text-green-700 dark:text-green-300 text-sm"
          >
            <Phone size={14} />
            <span>Call</span>
          </a>
          <button
            onClick={() => handleCopyPhone(lead.phone, userLead.id)}
            className="p-1.5 rounded bg-gray-100 dark:bg-gray-700"
          >
            {copiedPhone === userLead.id ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <Copy size={14} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>
          {userLead.notes && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
              📝 {userLead.notes.substring(0, 30)}{userLead.notes.length > 30 ? '...' : ''}
            </span>
          )}
        </div>

        {/* Tags */}
        <div>
          <TagInput
            tags={userLead.tags || []}
            onTagsChange={(newTags) => handleTagsChange(userLead.id, userLead.source, newTags)}
            disabled={isSaving}
          />
        </div>
      </div>
    );
  };

  // Desktop Table Row
  const renderLeadRow = (userLead) => {
    const lead = userLead.lead;
    const isSaving = savingLeads.has(userLead.id);

    const displayName = lead.owner_name || lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown';
    
    return (
      <tr key={userLead.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-3">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              {getSourceIcon(userLead.source)}
            </div>
            <div className="min-w-0">
              <div 
                className="font-medium dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setSelectedLead(userLead)}
              >
                {displayName}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <a
                  href={`tel:${lead.phone}`}
                  className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                  title="Call this number"
                >
                  <Phone size={14} className="text-green-600 dark:text-green-400" />
                </a>
                <button
                  onClick={() => handleCopyPhone(lead.phone, userLead.id)}
                  className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  title="Copy phone number"
                >
                  {copiedPhone === userLead.id ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{lead.phone}</span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedLead(userLead)}>
          <div className="dark:text-white">{lead.property_address}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lead.city}, {lead.state} {lead.zip_code}
          </div>
        </td>
        <td className="px-4 py-3">
          {lead.zestimate ? (
            <span className="font-semibold text-green-600 dark:text-green-400">
              ${lead.zestimate.toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <select
            value={userLead.status}
            onChange={(e) => handleStatusChange(userLead.id, userLead.source, e.target.value)}
            disabled={isSaving}
            className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="new">New</option>
            <option value="follow_up">Follow-up</option>
            <option value="not_interested">Not Interested</option>
            <option value="pending">Pending</option>
          </select>
          {isSaving && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Saving...</div>
          )}
        </td>
        <td className="px-4 py-3">
          {(userLead.status === 'follow_up' || userLead.status === 'not_interested' || userLead.status === 'pending') ? (
            <div className="flex items-center gap-2">
              {userLead.countdown_days > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                    {userLead.countdown_days} day{userLead.countdown_days !== 1 ? 's' : ''}
                  </span>
                  <select
                    value=""
                    onChange={(e) => handleCountdownChange(userLead.id, userLead.source, e.target.value)}
                    disabled={isSaving}
                    className="border dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-50 cursor-pointer hover:border-blue-500"
                  >
                    <option value="">Change...</option>
                    <option value="7">7 days</option>
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              ) : (
                <select
                  value=""
                  onChange={(e) => handleCountdownChange(userLead.id, userLead.source, e.target.value)}
                  disabled={isSaving}
                  className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Set countdown...</option>
                  <option value="7">7 days</option>
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              )}
              {isSaving && (
                <span className="text-xs text-blue-600 dark:text-blue-400">Saving...</span>
              )}
            </div>
          ) : (
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
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <TagInput
            tags={userLead.tags || []}
            onTagsChange={(newTags) => handleTagsChange(userLead.id, userLead.source, newTags)}
            disabled={isSaving}
          />
        </td>
        <td className="px-4 py-3">
          <button
            onClick={() => setSelectedLead(userLead)}
            className="p-2 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            title="View details"
          >
            <Eye size={16} className="text-blue-600 dark:text-blue-400" />
          </button>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-56 mt-2 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLeadCard key={i} />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLeadCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Get unique cities from leads
  const uniqueCities = [...new Set(leads.map(l => l.lead?.city).filter(Boolean))].sort();

  // Get unique tags from leads
  const uniqueTags = [...new Set(leads.flatMap(l => l.tags || []))].sort();

  // Count active filters
  const activeFilterCount = [
    filters.source !== 'all',
    filters.city !== 'all',
    filters.tag !== 'all',
    filters.pendingStatus !== 'all',
    filters.countdownDays !== 'all'
  ].filter(Boolean).length;

  // Handle filter apply
  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setCallNowPage(1);
    setPendingPage(1);
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    const clearedFilters = {
      source: 'all',
      city: 'all',
      tag: 'all',
      pendingStatus: 'all',
      countdownDays: 'all',
      countdownCompare: 'gte'
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setSearchTerm('');
    setCallNowPage(1);
    setPendingPage(1);
  };

  // Remove single filter
  const removeFilter = (filterKey) => {
    const newFilters = { ...filters, [filterKey]: 'all' };
    setFilters(newFilters);
    setTempFilters(newFilters);
    setCallNowPage(1);
    setPendingPage(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Leads</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track your leads</p>
        </div>

        {/* Search Bar and Filter Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCallNowPage(1);
                setPendingPage(1);
              }}
              placeholder="Search by name, phone, address..."
              className="w-full pl-10 pr-4 py-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => {
              setTempFilters({ ...filters });
              setFilterPanelOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export Button - Pro Plan Only */}
          <div className="relative group">
            <button
              onClick={isProPlan ? handleExportCSV : undefined}
              disabled={!isProPlan || exporting || leads.length === 0}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50 ${
                isProPlan 
                  ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {!isProPlan ? <Lock size={18} /> : exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            {!isProPlan && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Pro plan required
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {(activeFilterCount > 0 || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Active:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                Search: "{searchTerm}"
                <button onClick={() => { setSearchTerm(''); setCallNowPage(1); setPendingPage(1); }} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.source !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                {filters.source === 'subscription' ? 'Subscription' : 'Purchased'}
                <button onClick={() => removeFilter('source')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.city !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                {filters.city}
                <button onClick={() => removeFilter('city')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.tag !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                {filters.tag}
                <button onClick={() => removeFilter('tag')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.pendingStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                {filters.pendingStatus.replace('_', ' ')}
                <button onClick={() => removeFilter('pendingStatus')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.countdownDays !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                {filters.countdownCompare === 'eq' ? '=' : filters.countdownCompare === 'lte' ? '≤' : '≥'} {filters.countdownDays} days
                <button onClick={() => removeFilter('countdownDays')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            
            <button
              onClick={handleClearAllFilters}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Call Now Section */}
        <div>
          <div className="px-4 py-4 bg-green-50 dark:bg-green-900/20 rounded-t-lg md:rounded-lg md:mb-0">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Call Now ({callNowLeads.length})
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">These leads need to be called</p>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 mt-3">
            {callNowPaginatedLeads.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                No leads to call right now
              </div>
            ) : (
              <>
                {callNowPaginatedLeads.map(renderLeadCard)}
                {/* Mobile Pagination */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <PaginationControls
                    currentPage={callNowPage}
                    totalPages={callNowTotalPages}
                    totalItems={callNowLeads.length}
                    pageSize={callNowPageSize}
                    onPageChange={setCallNowPage}
                    onPageSizeChange={handleCallNowPageSizeChange}
                    startIndex={callNowStartIndex}
                  />
                </div>
              </>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900">
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
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {callNowPaginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No leads to call right now
                      </td>
                    </tr>
                  ) : (
                    callNowPaginatedLeads.map(renderLeadRow)
                  )}
                </tbody>
              </table>
            </div>
            {/* Call Now Pagination */}
            <PaginationControls
              currentPage={callNowPage}
              totalPages={callNowTotalPages}
              totalItems={callNowLeads.length}
              pageSize={callNowPageSize}
              onPageChange={setCallNowPage}
              onPageSizeChange={handleCallNowPageSizeChange}
              startIndex={callNowStartIndex}
            />
          </div>
        </div>

        {/* Pending Section */}
        <div>
          <div className="px-4 py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-lg md:rounded-lg md:mb-0">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Pending ({pendingLeads.length})
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Follow-ups and other pending leads</p>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 mt-3">
            {pendingPaginatedLeads.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                No pending leads
              </div>
            ) : (
              <>
                {pendingPaginatedLeads.map(renderLeadCard)}
                {/* Mobile Pagination */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <PaginationControls
                    currentPage={pendingPage}
                    totalPages={pendingTotalPages}
                    totalItems={pendingLeads.length}
                    pageSize={pendingPageSize}
                    onPageChange={setPendingPage}
                    onPageSizeChange={handlePendingPageSizeChange}
                    startIndex={pendingStartIndex}
                  />
                </div>
              </>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900">
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
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPaginatedLeads.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No pending leads
                      </td>
                    </tr>
                  ) : (
                    pendingPaginatedLeads.map(renderLeadRow)
                  )}
                </tbody>
              </table>
            </div>
            {/* Pending Pagination */}
            <PaginationControls
              currentPage={pendingPage}
              totalPages={pendingTotalPages}
              totalItems={pendingLeads.length}
              pageSize={pendingPageSize}
              onPageChange={setPendingPage}
              onPageSizeChange={handlePendingPageSizeChange}
              startIndex={pendingStartIndex}
            />
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead.lead}
          userLead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updatedLead) => {
            setLeads(prevLeads =>
              prevLeads.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l)
            );
          }}
        />
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={tempFilters}
        onFiltersChange={setTempFilters}
        onApply={handleApplyFilters}
        onClearAll={handleClearAllFilters}
        cities={uniqueCities}
        tags={uniqueTags}
      />
    </Layout>
  );
}
