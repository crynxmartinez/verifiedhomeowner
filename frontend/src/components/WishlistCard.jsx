import { useState } from 'react';
import { ChevronUp, ChevronDown, User, Clock } from 'lucide-react';

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

export default function WishlistCard({ request, onVote }) {
  const [expanded, setExpanded] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleVote = async (e) => {
    e.stopPropagation();
    if (voting) return;
    
    setVoting(true);
    try {
      await onVote(request.id, request.hasVoted);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center justify-start p-4 border-r border-gray-200 dark:border-gray-700 min-w-[70px]">
          <button
            onClick={handleVote}
            disabled={voting}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
              request.hasVoted
                ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
            } ${voting ? 'opacity-50' : ''}`}
          >
            <ChevronUp className={`h-6 w-6 ${request.hasVoted ? 'fill-current' : ''}`} />
            <span className={`text-lg font-bold ${request.hasVoted ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
              {request.voteCount}
            </span>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {request.title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
          </div>

          {/* Description */}
          <p className={`text-gray-600 dark:text-gray-400 text-sm ${expanded ? '' : 'line-clamp-2'}`}>
            {request.description}
          </p>

          {/* Expand indicator */}
          {!expanded && request.description.length > 150 && (
            <button 
              className="text-blue-500 text-sm mt-1 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
            >
              Read more
            </button>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {request.user?.name || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTimeAgo(request.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
