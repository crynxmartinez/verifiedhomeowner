import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[450px]
        transform transition-all duration-300
        ${bgColors[type] || bgColors.info}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {icons[type] || icons.info}
      <p className="text-gray-900 dark:text-white font-medium flex-1">{message}</p>
      <button
        onClick={handleClose}
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Toast container for multiple toasts
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
}
