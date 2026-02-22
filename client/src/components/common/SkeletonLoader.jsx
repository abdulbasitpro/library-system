// Skeleton for a single BookCard
export const BookCardSkeleton = () => (
  <div className="card p-4 animate-pulse">
    <div className="h-48 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-3 w-1/2" />
    <div className="flex gap-2">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
    </div>
  </div>
);

// Grid of skeleton cards
export const BookGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for a table row
export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
      </td>
    ))}
  </tr>
);

// Skeleton for stat cards
export const StatCardSkeleton = () => (
  <div className="stat-card animate-pulse">
    <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
    <div className="flex-1">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-1/2" />
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
    </div>
  </div>
);

export default BookCardSkeleton;
