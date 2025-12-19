export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </td>
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonLeadCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStats key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}
