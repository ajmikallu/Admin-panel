// ============================================
// FILE: src/components/skeleton/PostCardSkeleton.tsx
// ============================================
export const PostCardSkeleton = () => (
  <div className="col-span-12 md:col-span-4">
    <div className="relative aspect-video w-full animate-pulse overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700" />
    <div className="mt-4 flex flex-1 flex-col gap-3">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-6 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

// ============================================
// FILE: src/components/skeleton/FeaturedPostSkeleton.tsx
// ============================================
export const FeaturedPostSkeleton = () => (
  <>
    <div className="col-span-12 pb-5 md:pb-0 lg:col-span-7">
      <div className="h-64 w-full animate-pulse rounded-md bg-gray-200 md:h-82 dark:bg-gray-700" />
    </div>
    <div className="col-span-12 md:col-span-5">
      <div className="space-y-5 text-center">
        <div className="mx-auto h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-10 space-y-3">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-gray-200 md:mx-0 dark:bg-gray-700" />
        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200 md:mx-0 dark:bg-gray-700" />
        <div className="mx-auto h-3 w-24 animate-pulse rounded bg-gray-200 md:mx-0 dark:bg-gray-700" />
      </div>
    </div>
  </>
);
