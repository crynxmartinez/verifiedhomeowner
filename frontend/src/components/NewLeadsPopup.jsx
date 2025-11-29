import { useState, useEffect } from 'react';
import { X, Sparkles, Phone } from 'lucide-react';

export default function NewLeadsPopup({ newLeadsCount, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if we've already shown the popup today
    const lastShown = localStorage.getItem('newLeadsPopupDate');
    const today = new Date().toDateString();

    if (newLeadsCount > 0 && lastShown !== today) {
      setShouldShow(true);
      // Small delay for smooth entrance
      setTimeout(() => setIsVisible(true), 500);
    }
  }, [newLeadsCount]);

  const handleClose = () => {
    // Only mark as shown when user actually closes it
    localStorage.setItem('newLeadsPopupDate', new Date().toDateString());
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!shouldShow || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform animate-bounce-in overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">New Leads!</h2>
          </div>
          <p className="text-green-100">You've got fresh leads waiting for you</p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            {newLeadsCount}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            new lead{newLeadsCount > 1 ? 's' : ''} distributed today
          </p>

          <a
            href="/leads"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition w-full justify-center"
          >
            <Phone size={20} />
            Start Calling
          </a>
          
          <button
            onClick={handleClose}
            className="mt-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition"
          >
            Maybe later
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
