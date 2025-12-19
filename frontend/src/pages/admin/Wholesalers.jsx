import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Users, Activity, CreditCard, Mail, Search, Download, ChevronUp, ChevronDown, Edit2, X, Save, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const EMAIL_TYPE_LABELS = {
  marketplace_lead: 'Marketplace',
  verification: 'Verification',
  password_reset: 'Password Reset',
  welcome: 'Welcome',
  announcement: 'Announcement',
};

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  elite: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  pro: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const ACTIVITY_COLORS = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  inactive: 'bg-red-500',
};

function formatTimeAgo(date) {
  if (!date) return 'Never';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return then.toLocaleDateString();
}

export default function Wholesalers() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [wholesalers, setWholesalers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmail, setFilterEmail] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan_type: '',
    password: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const fetchWholesalers = async () => {
    try {
      const { data } = await adminAPI.getWholesalers();
      setStats(data.stats);
      setWholesalers(data.wholesalers);
    } catch (error) {
      console.error('Failed to fetch wholesalers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      plan_type: user.plan_type || 'free',
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      plan_type: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleSaveModal = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        plan_type: formData.plan_type
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await adminAPI.updateUser(editingUser.id, updateData);
      handleCloseModal();
      fetchWholesalers();
      toast.success('Wholesaler updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error.response?.data?.error || 'Failed to update wholesaler');
    } finally {
      setSaving(false);
    }
  };

  // Filter and sort wholesalers
  const filteredWholesalers = wholesalers
    .filter(w => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!w.name?.toLowerCase().includes(query) && !w.email?.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Plan filter
      if (filterPlan !== 'all' && w.plan_type !== filterPlan) return false;
      // Status filter
      if (filterStatus !== 'all' && w.activity_status !== filterStatus) return false;
      // Email filter
      if (filterEmail !== 'all') {
        if (filterEmail === 'never' && w.last_email_sent_at) return false;
        if (filterEmail !== 'never' && w.last_email_type !== filterEmail) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        case 'plan_type':
          aVal = a.plan_type;
          bVal = b.plan_type;
          break;
        case 'last_login_at':
          aVal = a.last_login_at ? new Date(a.last_login_at) : new Date(0);
          bVal = b.last_login_at ? new Date(b.last_login_at) : new Date(0);
          break;
        case 'total_leads':
          aVal = a.total_leads;
          bVal = b.total_leads;
          break;
        case 'last_email_sent_at':
          aVal = a.last_email_sent_at ? new Date(a.last_email_sent_at) : new Date(0);
          bVal = b.last_email_sent_at ? new Date(b.last_email_sent_at) : new Date(0);
          break;
        case 'created_at':
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Plan', 'Status', 'Email Verified', 'Last Login', 'Total Leads', 'Marketplace Purchases', 'Last Email', 'Last Email Type', 'Target Markets', 'Joined'];
    const rows = filteredWholesalers.map(w => [
      w.name,
      w.email,
      w.plan_type,
      w.activity_status,
      w.email_verified ? 'Yes' : 'No',
      w.last_login_at ? new Date(w.last_login_at).toLocaleString() : 'Never',
      w.total_leads,
      w.marketplace_purchases,
      w.last_email_sent_at ? new Date(w.last_email_sent_at).toLocaleString() : 'Never',
      w.last_email_type || 'N/A',
      w.preferred_states?.join(', ') || 'None',
      new Date(w.created_at).toLocaleDateString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wholesalers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading wholesalers...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wholesalers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor your wholesaler users</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Wholesalers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total || 0}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active This Week</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.activeThisWeek || 0}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Paid Plans</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.paidPlans || 0}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Emailed This Week</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.emailedThisWeek || 0}</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Plan Filter */}
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="elite">Elite</option>
              <option value="pro">Pro</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active (7d)</option>
              <option value="idle">Idle (7-30d)</option>
              <option value="inactive">Inactive (30d+)</option>
            </select>

            {/* Email Filter */}
            <select
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Emails</option>
              <option value="marketplace_lead">Marketplace</option>
              <option value="verification">Verification</option>
              <option value="password_reset">Password Reset</option>
              <option value="never">Never Emailed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('plan_type')}
                  >
                    <div className="flex items-center gap-1">
                      Plan <SortIcon field="plan_type" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('last_login_at')}
                  >
                    <div className="flex items-center gap-1">
                      Last Login <SortIcon field="last_login_at" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('total_leads')}
                  >
                    <div className="flex items-center gap-1">
                      Leads <SortIcon field="total_leads" />
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('last_email_sent_at')}
                  >
                    <div className="flex items-center gap-1">
                      Last Email <SortIcon field="last_email_sent_at" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Markets
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredWholesalers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No wholesalers found
                    </td>
                  </tr>
                ) : (
                  filteredWholesalers.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${ACTIVITY_COLORS[w.activity_status] || ACTIVITY_COLORS.inactive}`} title={w.activity_status || 'inactive'} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{w.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{w.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${PLAN_COLORS[w.plan_type] || PLAN_COLORS.free}`}>
                          {w.plan_type || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatTimeAgo(w.last_login_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">{w.total_leads}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {w.subscription_leads} sub / {w.marketplace_purchases} bought
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <p className="text-gray-600 dark:text-gray-300">{formatTimeAgo(w.last_email_sent_at)}</p>
                          {w.last_email_type && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {EMAIL_TYPE_LABELS[w.last_email_type] || w.last_email_type}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {w.preferred_states?.length > 0 ? (
                            w.preferred_states.map(state => (
                              <span key={state} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                {state}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleEdit(w)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                            title="Edit wholesaler"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredWholesalers.length} of {wholesalers.length} wholesalers
            </p>
          </div>
        </div>
      </div>

      {/* Edit Wholesaler Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Wholesaler</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Plan Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan Type *
                  </label>
                  <select
                    value={formData.plan_type}
                    onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                    className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="elite">Elite</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>

                {/* Password Section */}
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Change Password</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Leave blank to keep current password
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User Info</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Leads:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">{editingUser.total_leads || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Last Login:</span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">{formatTimeAgo(editingUser.last_login_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t dark:border-gray-700">
                <button
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModal}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
