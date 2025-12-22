import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import WishlistCard from '../../components/WishlistCard';
import SubmitIdeaModal from '../../components/SubmitIdeaModal';
import api from '../../lib/api';
import { Lightbulb, Plus, Flame, Sparkles, Loader2, FileText } from 'lucide-react';

export default function Wishlist() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('top');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [sortBy, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist', {
        params: {
          sort: sortBy,
          page: pagination.page,
          limit: 20,
        },
      });
      setRequests(data.requests);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      }));
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (requestId, currentVoted) => {
    try {
      const { data } = await api.post('/wishlist/vote', { featureRequestId: requestId });
      
      // Track vote event
      try {
        await api.post('/analytics/track', { eventType: 'wishlist_vote', eventData: { featureId: requestId } });
      } catch (e) { /* ignore */ }
      
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, hasVoted: data.voted, voteCount: data.voteCount }
            : req
        )
      );
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleSubmitSuccess = (newRequest) => {
    if (sortBy === 'new') {
      setRequests(prev => [newRequest, ...prev]);
    } else {
      fetchRequests();
    }
    setShowModal(false);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPagination(prev => ({ ...prev, page: 1 }));
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
                  Community Wishlist
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Help shape the future of Verified Homeowner
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/30"
          >
            <Plus className="h-5 w-5" />
            Submit Idea
          </button>
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm w-fit">
          <button
            onClick={() => handleSortChange('top')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'top'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Flame className="h-4 w-4" />
            Top Rated
          </button>
          <button
            onClick={() => handleSortChange('new')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              sortBy === 'new'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Newest
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No feature requests yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to share your ideas!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition"
            >
              <Plus className="h-5 w-5" />
              Submit Your First Idea
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <WishlistCard
                key={request.id}
                request={request}
                onVote={handleVote}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showModal && (
        <SubmitIdeaModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </Layout>
  );
}
