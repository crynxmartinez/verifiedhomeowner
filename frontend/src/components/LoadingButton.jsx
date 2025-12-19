import { Loader2 } from 'lucide-react';

export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border-2 border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const spinnerSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <Loader2 className={`${spinnerSizes[size]} animate-spin`} />
      )}
      {children}
    </button>
  );
}
