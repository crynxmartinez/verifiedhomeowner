import { CheckCircle, X, ArrowRight } from 'lucide-react';

export default function SuccessModal({ 
  title, 
  message, 
  onClose, 
  actionText = 'Got it!',
  actionLink = null,
  secondaryText = null,
  secondaryAction = null 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform animate-bounce-in overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Primary action */}
          {actionLink ? (
            <a
              href={actionLink}
              className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {actionText}
              <ArrowRight size={18} />
            </a>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {actionText}
            </button>
          )}

          {/* Secondary action */}
          {secondaryText && (
            <button
              onClick={secondaryAction || onClose}
              className="mt-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition"
            >
              {secondaryText}
            </button>
          )}
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
