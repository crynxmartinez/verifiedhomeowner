import { useState } from 'react';
import { User, Clock, Reply, Trash2, Send, Loader2, CornerDownRight } from 'lucide-react';
import useAuthStore from '../store/authStore';

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

export default function CommentItem({ comment, onReply, onDelete, isReply = false }) {
  const { user } = useAuthStore();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isOwner = user?.id === comment.userId;
  const isAdmin = user?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;

    setError('');
    setSubmitting(true);
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id, isReply ? comment.parentId : null);
    }
  };

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
              <User className="h-3.5 w-3.5" />
              {comment.user?.name || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition p-1"
              title="Delete comment"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Actions */}
        {!isReply && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition"
            >
              <Reply className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-2 ml-4">
          {error && (
            <div className="text-red-500 text-xs mb-2">{error}</div>
          )}
          <div className="flex gap-2">
            <div className="flex items-center text-gray-400">
              <CornerDownRight className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              maxLength={1000}
              autoFocus
              className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!replyContent.trim() || submitting}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
                setError('');
              }}
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={{ ...reply, parentId: comment.id }}
              onReply={onReply}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
