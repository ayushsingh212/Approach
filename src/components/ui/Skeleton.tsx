import { cn } from "@/src/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton - A premium shimmer-effect loading state UI
 * 
 * Usage:
 * <Skeleton className="h-4 w-[250px]" />
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-700/60",
        className
      )}
    >
      {/* Premium Shimmer Overlay */}
      <div className="h-full w-full relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}

/**
 * SkeletonCard - Prebuilt cards for company/user list loading
 */
export function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white/50 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * SkeletonRow - Horizontal rows for logs/list loading
 */
export function SkeletonRow() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-slate-100 last:border-0">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
    </div>
  );
}
