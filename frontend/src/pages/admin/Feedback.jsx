import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Lightbulb, ChevronUp, User, Clock, MessageCircle, ChevronDown, Loader2, Filter } from 'lucide-react';
import CommentSection from '../../components/CommentSection';

const STATUS_STYLES = {
  open: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  planned: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  closed: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

const STATUS_LABELS = {
  open: 'Open',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
  closed: 'Closed',
};

const STATUS_OPTIONS = ['open', 'planned', 'in_progress', 'completed', 'closed'];

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminWishlist() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('top');
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [sortBy, filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = { sort: sortBy, limit: 100 };
      if (filterStatus) params.status = filterStatus;
      
      const { data } = await api.get('/wishlist', { params });
      setRequests(data.requests);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdatingStatus(requestId);
    try {
      await api.patch(`/wishlist/${requestId}`, { status: newStatus });
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this feature request?')) return;
    
    try {
      await api.delete(`/wishlist/${requestId}`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const stats = {
    total: requests.length,
    open: requests.filter(r => r.status === 'open').length,
    planned: requests.filter(r => r.status === 'planned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Feature Wishlist
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Manage user feature requests
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-gray-400">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.open}</div>
            <div className="text-sm text-gray-500">Open</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
            <div className="text-sm text-gray-500">Planned</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm">
            <button
              onClick={() => setSortBy('top')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                sortBy === 'top'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Top Voted
            </button>
            <button
              onClick={() => setSortBy('new')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                sortBy === 'new'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Newest
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No feature requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex">
                  {/* Vote Count */}
                  <div className="flex flex-col items-center justify-start p-4 border-r border-gray-200 dark:border-gray-700 min-w-[70px]">
                    <div className="flex flex-col items-center gap-1 p-2 text-orange-500">
                      <ChevronUp className="h-6 w-6" />
                      <span className="text-lg font-bold">{request.voteCount}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                        {request.title}
                      </h3>
                      
                      {/* Status Dropdown */}
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        disabled={updatingStatus === request.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLES[request.status]} ${updatingStatus === request.id ? 'opacity-50' : ''}`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <p className={`text-gray-600 dark:text-gray-400 text-sm ${expandedId === request.id ? '' : 'line-clamp-2'}`}>
                      {request.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {request.user?.name || 'Anonymous'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTimeAgo(request.createdAt)}
                      </span>
                      <button
                        onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-600 transition ml-auto"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Comments
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedId === request.id ? 'rotate-180' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedId === request.id && (
                      <CommentSection featureRequestId={request.id} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
