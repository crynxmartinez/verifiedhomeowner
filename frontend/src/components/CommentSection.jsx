import { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import api from '../lib/api';
import CommentItem from './CommentItem';

export default function CommentSection({ featureRequestId }) {
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [featureRequestId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/wishlist/comments', {
        params: { featureRequestId },
      });
      setComments(data.comments);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/wishlist/comments', {
        featureRequestId,
        content: newComment.trim(),
      });
      // Track comment event
      try {
        await api.post('/analytics/track', { eventType: 'feedback_comment', eventData: { featureId: featureRequestId } });
      } catch (e) { /* ignore */ }
      setComments(prev => [...prev, data.comment]);
      setTotalCount(prev => prev + 1);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const { data } = await api.post('/wishlist/comments', {
        featureRequestId,
        content,
        parentId,
      });
      
      // Add reply to the parent comment
      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), data.comment] }
            : comment
        )
      );
      setTotalCount(prev => prev + 1);
      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (commentId, parentId) => {
    try {
      await api.delete('/wishlist/comments', {
        data: { commentId },
      });

      if (parentId) {
        // Remove reply from parent
        setComments(prev =>
          prev.map(comment =>
            comment.id === parentId
              ? { ...comment, replies: comment.replies.filter(r => r.id !== commentId) }
              : comment
          )
        );
      } else {
        // Remove top-level comment (and its replies)
        const comment = comments.find(c => c.id === commentId);
        const replyCount = comment?.replies?.length || 0;
        setComments(prev => prev.filter(c => c.id !== commentId));
        setTotalCount(prev => prev - 1 - replyCount);
      }
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {totalCount} {totalCount === 1 ? 'Comment' : 'Comments'}
        </span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            maxLength={1000}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
