// ============================================
// FILE: src/pages/public/BlogList.tsx (Updated)
// ============================================
import { useEffect, useState } from "react";
import {
  getPublishedPosts,
  getLatestFeaturedPost,
  getLatestPinnedPosts,
} from "@/features/blog/api";
import type { PostView } from "@/types/blog.types";
import { Link } from "react-router-dom";
import { parsePostContent } from "@/lib/utils";
import { useLoader } from "@/hooks/useLoader";
import { PostCardSkeleton, FeaturedPostSkeleton } from "@/components/skeleton";

export default function BlogList() {
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredPost, setFeaturedPost] = useState<PostView | null>(null);
  const [pinnedPosts, setPinnedPosts] = useState<PostView[]>([]);

  const { withLoader } = useLoader();

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      setError(null);

      try {
        await withLoader(async () => {
          const [postsResult, featuredResult, pinnedResult] = await Promise.all(
            [
              getPublishedPosts(1, 10, 3),
              getLatestFeaturedPost(),
              getLatestPinnedPosts(),
            ],
          );

          if (postsResult.error) {
            throw new Error(postsResult.error.message);
          }
          setPosts(postsResult.data ?? []);

          if (featuredResult.error) {
            console.error(
              "Error fetching featured post:",
              featuredResult.error,
            );
          } else {
            setFeaturedPost(featuredResult.data);
          }

          if (pinnedResult.error) {
            console.error("Error fetching pinned posts:", pinnedResult.error);
          } else {
            setPinnedPosts(pinnedResult.data ?? []);
          }
        }, "Loading blog posts...");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, [withLoader]);

  if (error) {
    return (
      <main>
        <div className="container mx-auto max-w-5xl px-3 pt-10">
          <div className="flex items-center justify-center py-20">
            <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                Failed to Load Posts
              </p>
              <p className="mt-2 text-sm text-red-500 dark:text-red-300">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container mx-auto max-w-5xl gap-10 text-gray-800 dark:text-gray-200">
        {/* Featured Post Section */}
        <div className="px-3 pt-10">
          <div className="featured-post grid w-full grid-cols-12 pb-10 md:gap-10">
            {loading ? (
              <FeaturedPostSkeleton />
            ) : featuredPost ? (
              <>
                <div className="col-span-12 pb-5 md:pb-0 lg:col-span-7">
                  <Link to={`/blogs/${featuredPost.slug}`}>
                    <img
                      className="h-64 w-full rounded-md object-cover transition-transform hover:scale-105 md:h-82"
                      width={640}
                      height={350}
                      loading="lazy"
                      src={
                        featuredPost.featured_image_url ||
                        "https://www.hostinger.com/blog/wp-content/uploads/sites/4/2026/01/horizons-llms-1024x576.webp"
                      }
                      alt={featuredPost.title || "Featured image"}
                    />
                  </Link>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <div className="text-center">
                    <p className="featured-post-title mb-5 text-xl font-bold">
                      Featured story
                    </p>
                    <h3 className="featured-post-header mb-5">
                      {featuredPost.title}
                    </h3>
                    <p className="featured-post-body">
                      {parsePostContent(featuredPost)
                        ?.blocks?.find((b) => b.type === "paragraph")
                        ?.data?.text?.slice(0, 150) + "..."}
                    </p>
                  </div>
                  <div className="author-container mt-10">
                    <div className="author-avatar">
                      {/* Placeholder for author avatar */}
                    </div>
                    <div className="author-info text-center md:text-start">
                      <p className="author-name">
                        {featuredPost.author?.full_name || "Unknown Author"}
                      </p>
                      <p className="post-date">
                        {featuredPost.published_at
                          ? new Date(featuredPost.published_at).toDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Pinned Posts Section */}
        <div className="pinned px-3">
          <h1 className="text-center text-2xl font-extrabold md:text-start">
            Top Stories
          </h1>
          <div className="mt-8 grid grid-cols-12 pb-10 md:gap-10">
            {loading ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : (
              pinnedPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="col-span-12 md:col-span-4">
                  <Link to={`/blogs/${post.slug}`}>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <img
                        src={
                          post.featured_image_url ||
                          "https://www.hostinger.com/blog/wp-content/uploads/sites/4/2026/01/horizons-llms-1024x576.webp"
                        }
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="mt-4 flex flex-1 flex-col">
                    <p className="pb-3 text-sm text-gray-600 dark:text-gray-400">
                      {post.published_at
                        ? new Date(post.published_at).toDateString()
                        : ""}
                    </p>

                    <h5 className="pb-4 text-xl leading-snug font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                      <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
                    </h5>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Posts Section */}
        <div className="posts px-3 pb-10">
          <h1 className="text-center text-2xl font-extrabold md:text-start">
            Latest Posts
          </h1>
          <div className="mt-8 grid grid-cols-12 md:gap-10">
            {loading ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : (
              posts.slice(0, 3).map((post) => (
                <div key={post.id} className="col-span-12 md:col-span-4">
                  <Link to={`/blogs/${post.slug}`}>
                    <div className="relative aspect-video w-full overflow-hidden rounded-md">
                      <img
                        src={
                          post.featured_image_url ||
                          "https://www.hostinger.com/blog/wp-content/uploads/sites/4/2026/01/horizons-llms-1024x576.webp"
                        }
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="mt-4 flex flex-1 flex-col">
                    <p className="pb-3 text-sm text-gray-600 dark:text-gray-400">
                      {post.published_at
                        ? new Date(post.published_at).toDateString()
                        : ""}
                    </p>

                    <h5 className="pb-4 text-xl leading-snug font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                      <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
                    </h5>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto" />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="link pt-5">
            <Link
              to={"/blogs/latest-posts"}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
