import React from 'react';

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`}></div>
);

export const BookCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    {Array(cols).fill(0).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
      </td>
    ))}
  </tr>
);
