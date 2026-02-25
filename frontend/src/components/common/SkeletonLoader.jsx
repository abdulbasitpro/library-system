import React from 'react';

/**
 * Shimmer skeleton that matches the design system
 */
export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} aria-hidden="true" />
);

export const SkeletonCard = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />
    <div className="flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-lg" />
      <Skeleton className="h-8 flex-1 rounded-lg" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <tr className="border-b border-neutral-50 dark:border-neutral-800">
    {[40, 24, 16, 20].map((w, i) => (
      <td key={i} className="px-5 py-3.5">
        <Skeleton className={`h-3.5 w-${w} rounded-md`} style={{ width: `${w * 4}px` }} />
      </td>
    ))}
  </tr>
);

export const SkeletonStat = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-7 w-16 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
    </div>
  </div>
);

export const SkeletonBookCard = () => (
  <div className="card overflow-hidden">
    <Skeleton className="h-44 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

export default Skeleton;
