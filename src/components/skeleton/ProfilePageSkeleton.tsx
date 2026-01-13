// src/components/skeleton/ProfilePageSkeleton.tsx

export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="overflow-hidden bg-white shadow dark:bg-gray-800">
        {/* Header Skeleton */}
        <div className="px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center space-x-4">
              {/* Avatar Skeleton */}
              <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                {/* Name Skeleton */}
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                {/* Role Skeleton */}
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
            {/* Edit Button Skeleton */}
            <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* Profile Details Skeleton */}
        <div className="p-6">
          {/* Section Title */}
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

          {/* Info Items */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Age */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Country */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

          {/* Member Since */}
          <div className="mt-6">
            <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );
};
