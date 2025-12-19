import { FileText, ShoppingCart, MessageCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const icons = {
  leads: FileText,
  marketplace: ShoppingCart,
  support: MessageCircle,
  search: Search,
};

export default function EmptyState({
  type = 'leads',
  title = 'No items found',
  description = 'Get started by adding your first item.',
  actionText,
  actionLink,
  onAction,
}) {
  const Icon = icons[type] || FileText;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
        <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && (actionLink || onAction) && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
