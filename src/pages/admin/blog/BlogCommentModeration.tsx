import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { MessageSquare, XCircle } from "lucide-react";
import { useCommentsModeration } from "@/hooks/useCommentsModeration";
import { CommentFilters } from "@/components/admin/comment/CommentFilters";
import { CommentCard } from "@/components/admin/comment/CommentCard";
import { CommentTable } from "@/components/admin/comment/CommentTable";

const ADMIN_ROLES = ["admin", "superAdmin"] as const;

export default function BlogCommentModeration() {
  const { profile, loading: profileLoading } = useProfile();

  // Check if user has admin access
  const hasAdminAccess = useMemo(
    () => ADMIN_ROLES.includes(profile?.role as (typeof ADMIN_ROLES)[number]),
    [profile?.role],
  );

  // Use comments moderation hook
  const {
    comments,
    loading,
    filterLoading,
    filter,
    setFilter,
    handleModerate,
    moderatingId,
  } = useCommentsModeration(profileLoading, hasAdminAccess);

  // Memoized empty state message
  const emptyStateMessage = useMemo(
    () =>
      filter === "all"
        ? "There are no comments to display."
        : `No ${filter} comments found.`,
    [filter],
  );

  // Memoized stats text
  const statsText = useMemo(
    () =>
      comments.length > 0
        ? `Showing ${comments.length} comment${comments.length !== 1 ? "s" : ""}${
            filter !== "all" ? ` (${filter})` : ""
          }`
        : null,
    [comments.length, filter],
  );

  // Loading state: Profile loading
  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Access control: Check admin role
  if (!hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-800">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Access Denied
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Admin or SuperAdmin privileges required to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Loading state: Initial comments load
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading comments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
            Blog Comment Moderation
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
            Review and moderate blog comments
          </p>
        </div>

        {/* Filter Buttons */}
        <CommentFilters
          filter={filter}
          onFilterChange={setFilter}
          disabled={filterLoading}
        />

        {/* Mobile/Tablet Card View */}
        <div className="space-y-3 lg:hidden">
          {filterLoading ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading comments...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-12 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No comments found
              </h3>
              <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {emptyStateMessage}
              </p>
              {filter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="mt-2"
                >
                  View all comments
                </Button>
              )}
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onModerate={handleModerate}
                moderatingId={moderatingId}
                disabled={filterLoading}
              />
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block dark:border-gray-700 dark:bg-gray-900">
          {filterLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Loading comments...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No comments found
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {emptyStateMessage}
              </p>
              {filter !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter("all")}
                  className="mt-2"
                >
                  View all comments
                </Button>
              )}
            </div>
          ) : (
            <CommentTable
              comments={comments}
              onModerate={handleModerate}
              moderatingId={moderatingId}
              disabled={filterLoading}
            />
          )}
        </div>

        {/* Stats Footer */}
        {statsText && (
          <div className="mt-3 text-xs text-gray-600 sm:mt-4 sm:text-sm dark:text-gray-400">
            {statsText}
          </div>
        )}
      </div>
    </div>
  );
}
