import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { LikedPostsWithTimestamp } from "@/types/blog.types";
import { getCustomerLikedPosts } from "@/features/blog/api/likes.api";
import { Heart, Eye, Clock, Calendar, Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";

interface LikedPostsDashboardProps {
  initialLimit?: number;
  loadMoreLimit?: number;
  onError?: (error: string) => void;
}

/**
 * Reusable paginated dashboard component for displaying liked posts
 * - Shows latest 20 posts initially
 * - Supports "Load More" button to fetch next batch
 * - Displays featured image, title, excerpt, author info, liked date, engagement metrics
 * - Includes null checks and placeholders
 */
export function LikedPostsDashboard({
  initialLimit = 20,
  loadMoreLimit = 20,
  onError,
}: LikedPostsDashboardProps) {
  const [posts, setPosts] = useState<LikedPostsWithTimestamp>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch initial posts
  const fetchInitialPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getCustomerLikedPosts(initialLimit, 0);

      setPosts(result.data);
      setHasMore(result.hasMore);
      setTotal(result.total);
      logger.log(`Loaded ${result.data.length} liked posts`);
      logger.log(
        { postIds: result.data.map((p) => p.post.id) },
        "Loaded liked posts",
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch liked posts";
      setError(errorMessage);
      logger.error({ err }, "Error fetching liked posts");
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, onError]);

  // Load more posts
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const offset = posts.length;

      const result = await getCustomerLikedPosts(loadMoreLimit, offset);

      setPosts((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      logger.log(`Loaded ${result.data.length} more posts`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load more posts";
      setError(errorMessage);
      logger.error({ err }, "Error loading more posts");
      onError?.(errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, posts.length, loadMoreLimit, onError]);

  // Fetch on mount
  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <Button onClick={fetchInitialPosts} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Initial loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex gap-4">
              <div className="h-24 w-24 shrink-0 rounded-md bg-gray-300 md:h-32 md:w-48 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-3 w-full rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-3 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <Heart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          No liked posts yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start exploring and like posts you find interesting!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts List */}
      {posts.map((item) => {
        const { post, liked_at } = item;
        const author = post.author;
        const authorInitials =
          author?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";

        return (
          <article
            key={post.id}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <Link to={`/blogs/${post.slug}`} className="block">
              <div className="flex flex-col gap-4 p-6 md:flex-row">
                {/* Featured Image */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-md bg-gray-100 md:h-32 md:w-48 dark:bg-gray-700">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                      <span className="text-4xl text-gray-400 dark:text-gray-500">
                        📝
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Author and Metadata Row */}
                  <div className="mt-auto flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {author?.avatar_url ? (
                          <AvatarImage
                            src={author.avatar_url}
                            alt={author.full_name || "Author"}
                          />
                        ) : null}
                        <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {author?.full_name || "Unknown Author"}
                      </span>
                    </div>

                    {/* Divider */}
                    <span className="hidden text-gray-300 md:inline dark:text-gray-600">
                      •
                    </span>

                    {/* Liked Date */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Liked{" "}
                        {new Date(liked_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Divider */}
                    <span className="hidden text-gray-300 md:inline dark:text-gray-600">
                      •
                    </span>

                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-4">
                      {/* Like Count */}
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 fill-current" />
                        <span>{post.like_count}</span>
                      </div>

                      {/* View Count */}
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count}</span>
                      </div>

                      {/* Reading Time */}
                      {post.reading_time > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{post.reading_time} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="min-w-[140px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${total - posts.length} remaining)`
            )}
          </Button>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && posts.length > 0 && (
        <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Showing all {posts.length} of {total} liked{" "}
            {total === 1 ? "post" : "posts"}
          </p>
        </div>
      )}
    </div>
  );
}
