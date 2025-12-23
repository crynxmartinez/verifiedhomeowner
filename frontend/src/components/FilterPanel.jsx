import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onClearAll,
  cities = [],
  tags = []
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Small delay to ensure the element is in DOM before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen && !isAnimating) return null;

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClearAll = () => {
    onClearAll();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 max-w-full bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Source Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Source
            </label>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Sources' },
                { value: 'subscription', label: 'Subscription' },
                { value: 'purchased', label: 'Purchased' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="source"
                    value={option.value}
                    checked={filters.source === option.value}
                    onChange={(e) => onFiltersChange({ ...filters, source: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Tags
            </label>
            <select
              value={filters.tag}
              onChange={(e) => onFiltersChange({ ...filters, tag: e.target.value })}
              className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* Countdown Days Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Countdown Days
            </label>
            <div className="flex gap-2">
              {/* Comparison Type */}
              <select
                value={filters.countdownCompare}
                onChange={(e) => onFiltersChange({ ...filters, countdownCompare: e.target.value })}
                className="w-24 border dark:border-gray-600 rounded-lg px-2 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="eq">=</option>
                <option value="gte">≥</option>
                <option value="lte">≤</option>
              </select>
              {/* Days Value */}
              <select
                value={filters.countdownDays}
                onChange={(e) => onFiltersChange({ ...filters, countdownDays: e.target.value })}
                className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="0">0 days</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>

          {/* Pending Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Pending Status
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              Only applies to Pending board
            </p>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All Statuses' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'not_interested', label: 'Not Interested' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_contract', label: 'In Contract' },
                { value: 'closed', label: 'Closed' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pendingStatus"
                    value={option.value}
                    checked={filters.pendingStatus === option.value}
                    onChange={(e) => onFiltersChange({ ...filters, pendingStatus: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex gap-3">
          <button
            onClick={handleClearAll}
            className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
