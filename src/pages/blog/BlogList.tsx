import { useEffect, useState } from "react";
import {
  getPublishedPosts,
  getLatestFeaturedPost,
  getLatestPinnedPosts,
} from "@/features/blog/api";
import type { PostView } from "@/types/blog.types";
import { Link } from "react-router-dom";
import { parsePostContent } from "@/lib/utils";

export default function BlogList() {
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredPost, setFeaturedPost] = useState<PostView | null>(null);
  const [pinnedPosts, setPinnedPosts] = useState<PostView[]>([]);

  useEffect(() => {
    async function load() {
      const { data, error } = await getPublishedPosts(1, 10, 3);
      if (error) {
        setError(error.message);
      } else {
        setPosts(data ?? []);
      }
      setLoading(false);
    }
    load();

    async function loadFeaturedPost() {
      const { data, error } = await getLatestFeaturedPost();
      if (error) {
        console.error("Error fetching featured post:", error);
      } else {
        setFeaturedPost(data);
      }
    }
    loadFeaturedPost();

    async function loadPinnedPosts() {
      const { data, error } = await getLatestPinnedPosts();
      if (error) {
        console.error("Error fetching pinned posts:", error);
      } else {
        setPinnedPosts(data ?? []);
      }
    }
    loadPinnedPosts();
  }, []);

  if (loading) return <p>Loading blogs…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <div className="container mx-auto max-w-5xl gap-10 text-gray-800 dark:text-gray-200">
        <div className="px-3 pt-10">
          <div className="featured-post grid w-full grid-cols-12 pb-10 md:gap-10">
            {featuredPost && (
              <div className="col-span-12 pb-5 md:pb-0 lg:col-span-7">
                <Link to={`/blogs/${featuredPost.slug}`}>
                  <img
                    className="h-64 w-full rounded-md object-cover md:h-82"
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
            )}
            {featuredPost && (
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
            )}
          </div>
        </div>
        <div className="pinned px-3">
          <h1 className="text-center text-2xl font-extrabold md:text-start">
            Top Stories
          </h1>
          <div className="mt-8 grid grid-cols-12 pb-10 md:gap-10">
            {pinnedPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="col-span-12 md:col-span-4">
                <Link to={`/blogs/${post.slug}`}>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <img
                      src={
                        post.featured_image_url ||
                        "https://www.hostinger.com/blog/wp-content/uploads/sites/4/2026/01/horizons-llms-1024x576.webp"
                      }
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </Link>

                <div className="mt-4 flex flex-1 flex-col">
                  <p className="pb-3 text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toDateString()
                      : ""}
                  </p>

                  <h5 className="pb-4 text-xl leading-snug font-semibold">
                    {post.title}
                  </h5>

                  <p className="text-sm">{post.excerpt}</p>

                  {/* Spacer pushes bottom content down */}
                  <div className="mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="posts px-3 pb-10">
          <h1 className="text-center text-2xl font-extrabold md:text-start">
            Latest Posts
          </h1>
          <div className="mt-8 grid grid-cols-12 md:gap-10">
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="col-span-12 md:col-span-4">
                <Link to={`/blogs/${post.slug}`}>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <img
                      src={
                        post.featured_image_url ||
                        "https://www.hostinger.com/blog/wp-content/uploads/sites/4/2026/01/horizons-llms-1024x576.webp"
                      }
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </Link>

                <div className="mt-4 flex flex-1 flex-col">
                  <p className="pb-3 text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toDateString()
                      : ""}
                  </p>

                  <h5 className="pb-4 text-xl leading-snug font-semibold">
                    {post.title}
                  </h5>

                  <p className="text-sm">{post.excerpt}</p>

                  {/* Spacer pushes bottom content down */}
                  <div className="mt-auto" />
                </div>
              </div>
            ))}
          </div>
          <div className="link pt-5">
            <Link to={"/blogs/latest-posts"}>View all</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
