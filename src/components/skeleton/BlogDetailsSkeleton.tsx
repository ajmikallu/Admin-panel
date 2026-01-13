// src/components/skeleton/BlogDetailsSkeleton.tsx

export const BlogDetailsSkeleton = () => {
  return (
    <main className="bg-gray-50 py-12 dark:bg-gray-900">
      <article className="mx-auto max-w-4xl text-gray-900 dark:text-gray-100">
        {/* Featured Image Skeleton */}
        <div className="mb-8 overflow-hidden rounded-xl px-4">
          <div className="h-96 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Content Container */}
        <div className="rounded-xl px-4 py-5 shadow-sm md:px-12">
          {/* Badges Row Skeleton */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Title Skeleton */}
          <div className="mb-6 space-y-3">
            <div className="h-12 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Metadata Skeleton */}
          <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Excerpt Skeleton */}
          <div className="mb-8 rounded-lg bg-gray-200 p-6 dark:bg-gray-700">
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            {/* Paragraph 1 */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Heading */}
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

            {/* Paragraph 2 */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Image Placeholder */}
            <div className="h-64 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />

            {/* Paragraph 3 */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Tags Skeleton */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="mb-3 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          {/* Engagement Stats Skeleton */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </article>
    </main>
  );
};
