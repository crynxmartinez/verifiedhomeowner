import { useState, useRef, useEffect } from 'react';
import { Plus, X, Search } from 'lucide-react';

const PREDEFINED_TAGS = [
  'Hot',
  'Callback',
  'Interested',
  'Not Answering',
  'Left Voicemail',
  'Negotiating',
  'Send Offer',
  'Follow Up',
  'Motivated',
  'Cash Buyer',
  'Investor',
  'Tire Kicker'
];

export default function TagInput({ tags = [], onTagsChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const MAX_VISIBLE_TAGS = 2;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      handleAddTag(searchTerm.trim());
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Filter predefined tags based on search and exclude already added tags
  const filteredTags = PREDEFINED_TAGS.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !tags.includes(tag)
  );

  // Check if search term is a new custom tag
  const isCustomTag = searchTerm.trim() && 
    !PREDEFINED_TAGS.some(tag => tag.toLowerCase() === searchTerm.toLowerCase()) &&
    !tags.some(tag => tag.toLowerCase() === searchTerm.toLowerCase());

  // Determine which tags to show
  const visibleTags = isExpanded ? tags : tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col items-start gap-1">
        {/* First Tag Row - with +N more and + button */}
        <div className="flex items-center gap-1">
          {visibleTags[0] && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
              {visibleTags[0]}
              {!disabled && (
                <button
                  onClick={() => handleRemoveTag(visibleTags[0])}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          )}

          {/* Hidden Tags Count - on first row */}
          {!isExpanded && hiddenCount > 0 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              +{hiddenCount}
            </button>
          )}

          {/* Collapse Button - on first row when expanded */}
          {isExpanded && tags.length > MAX_VISIBLE_TAGS && (
            <button
              onClick={() => setIsExpanded(false)}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Less
            </button>
          )}

          {/* Add Tag Button - on first row */}
          {!disabled && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Add tag"
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* Remaining Visible Tags */}
        {visibleTags.slice(1).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium"
          >
            {tag}
            {!disabled && (
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b dark:border-gray-700">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or create tag..."
                className="w-full pl-7 pr-2 py-1.5 text-sm border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tag Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </button>
            ))}

            {/* Create Custom Tag Option */}
            {isCustomTag && (
              <button
                onClick={() => handleAddTag(searchTerm.trim())}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t dark:border-gray-700"
              >
                <span className="flex items-center gap-2">
                  <Plus size={14} />
                  Create "{searchTerm.trim()}"
                </span>
              </button>
            )}

            {/* No Results */}
            {filteredTags.length === 0 && !isCustomTag && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No tags found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
