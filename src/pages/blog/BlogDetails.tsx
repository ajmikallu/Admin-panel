import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostBySlug } from "@/features/blog/api";
import type { PostView } from "@/types/blog.types";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTrackView } from "@/hooks/useTrackView";
import { EditorRenderer } from "@/components/blog/EditorRenderer";
import type { OutputData } from "@editorjs/editorjs";
import { useLoader } from "@/hooks/useLoader";
import { BlogDetailsSkeleton } from "@/components/skeleton";

import {
  likePost,
  unlikePost,
  hasLikedPost,
} from "@/features/blog/api/likes.api";
import { toast } from "sonner";

export default function BlogDetails() {
  const { user } = useAuth();
  const { permissions } = useProfile();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [post, setPost] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const { withLoader } = useLoader();
  const [isCheckingLike, setIsCheckingLike] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        await withLoader(async () => {
          const { data, error } = await getPostBySlug(slug as string);

          if (error) {
            throw new Error("Post not found");
          }

          setPost(data);
        }, "Loading post...");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Post not found");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug, withLoader]);

  // Check if user has already liked the post
  useEffect(() => {
    if (!user?.id || !post) {
      setIsLiked(false);
      return;
    }

    async function checkLike() {
      try {
        setIsCheckingLike(true);
        const { data, error } = await hasLikedPost(post!.id, user!.id);
        if (error) {
          console.error("Error checking like status:", error);
          setIsLiked(false);
          return;
        }
        setIsLiked(!!data);
      } catch (err) {
        console.error("Failed to check like status:", err);
        setIsLiked(false);
      } finally {
        setIsCheckingLike(false);
      }
    }

    checkLike();
  }, [user?.id, post?.id]);

  // Track view with deduplication (tracks after 3 seconds)
  useTrackView({
    postId: post?.id || "",
    userId: user?.id,
    delay: 3000,
  });

  // Parse Editor.js content
  const parseContent = (content: string): OutputData | null => {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse content:", error);
      return null;
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    // Not authenticated - redirect to login
    if (!user) {
      toast.error("Sign in to like posts", {
        description: "Please log in to your account",
      });
      navigate("/login");
      return;
    }

    // Not a customer - cannot like
    if (!permissions.canLike) {
      toast.error("Cannot like posts", {
        description: "Only customers can like blog posts",
      });
      return;
    }

    if (!post?.id) return;

    const previousLiked = isLiked;
    const previousLikeCount = post.like_count || 0;

    try {
      setLikeLoading(true);

      if (isLiked) {
        // Unlike
        const { error } = await unlikePost(post.id);
        if (error) throw error;
        setIsLiked(false);
        setPost({ ...post, like_count: Math.max(0, previousLikeCount - 1) });
        toast.success("Post unliked");
      } else {
        // Like
        const { error } = await likePost(post.id);
        if (error) throw error;
        setIsLiked(true);
        setPost({ ...post, like_count: previousLikeCount + 1 });
        toast.success("Post liked!");
      }
    } catch (err) {
      // Revert optimistic update
      setIsLiked(previousLiked);
      setPost({ ...post, like_count: previousLikeCount });

      const errorMessage =
        err instanceof Error ? err.message : "Failed to like post";

      // Handle RLS policy error for non-customers
      if (
        errorMessage.includes("policy") ||
        errorMessage.includes("permission")
      ) {
        toast.error("Cannot like post", {
          description: "Only customers can like blog posts",
        });
      } else {
        toast.error("Failed to like post", {
          description: errorMessage,
        });
      }
    } finally {
      setLikeLoading(false);
    }
  };

  // Loading state - Show skeleton
  if (loading) {
    return <BlogDetailsSkeleton />;
  }

  // Error state - Show user-friendly error
  if (error || !post) {
    return (
      <main className="bg-gray-50 py-12 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-10 w-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              Post Not Found
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {error ||
                "The post you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const editorData = parseContent(post.content);

  return (
    <main className="bg-gray-50 py-12 dark:bg-gray-900">
      <article className="mx-auto max-w-4xl text-gray-900 dark:text-gray-100">
        {/* Pinned Badge */}
        {post.is_pinned && (
          <div className="mb-4 px-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1h-2zM9 5.5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
              </svg>
              Pinned Post
            </span>
          </div>
        )}

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8 overflow-hidden rounded-xl px-4">
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              className="h-auto w-full rounded-xl object-cover shadow-lg"
              loading="lazy"
            />
          </div>
        )}

        {/* Content Container */}
        <div className="rounded-xl px-4 py-5 shadow-sm md:px-12">
          {/* Badges Row */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {post.is_featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
            {post.category_id && post.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                {post.category.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            {post.published_at && (
              <time
                dateTime={post.published_at}
                className="flex items-center gap-1.5"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            {post.reading_time && post.reading_time > 0 && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {post.reading_time} min read
              </span>
            )}
            {post.view_count > 0 && (
              <span className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.view_count.toLocaleString()} views
              </span>
            )}
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div className="mb-8 rounded-lg bg-gray-200 p-6 dark:bg-gray-700 dark:text-white">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Editor.js Content */}
          {editorData ? (
            <div className="editor-content prose prose-lg dark:prose-invert max-w-none">
              <EditorRenderer data={editorData} />
            </div>
          ) : (
            <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
              <p className="text-red-600 dark:text-red-400">
                Failed to load content
              </p>
            </div>
          )}

          {/* Meta Keywords (SEO) */}
          {post.meta_keywords && post.meta_keywords.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.meta_keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                disabled={likeLoading || isCheckingLike}
                className={`flex items-center gap-2 transition-colors ${
                  isCheckingLike ? "cursor-wait opacity-50" : ""
                } ${
                  isLiked
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                } ${
                  !permissions.canLike
                    ? "cursor-not-allowed opacity-50"
                    : "hover:text-red-600 dark:hover:text-red-400"
                } ${likeLoading ? "opacity-75" : ""}`}
                title={
                  !permissions.canLike ? "Only customers can like posts" : ""
                }
              >
                <svg
                  className={`h-6 w-6 transition-transform ${
                    isLiked ? "fill-current" : ""
                  } ${likeLoading ? "animate-pulse" : ""}`}
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="font-medium">{post.like_count || 0}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="font-medium">{post.comment_count || 0}</span>
              </button>
            </div>

            {/* Share Button */}
            <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </article>

      {/* Custom CSS for Editor.js content */}
      <style>{`
        .editor-content {
          font-size: 1.125rem;
          line-height: 1.75;
          color: #374151;
        }

        .dark .editor-content {
          color: #d1d5db;
        }

        .editor-content h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-top: 2.5rem;
          margin-bottom: 1.25rem;
          color: #111827;
          line-height: 1.2;
        }

        .dark .editor-content h1 {
          color: #f9fafb;
        }

        .editor-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #111827;
          line-height: 1.3;
        }

        .dark .editor-content h2 {
          color: #f3f4f6;
        }

        .editor-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #111827;
          line-height: 1.4;
        }

        .dark .editor-content h3 {
          color: #e5e7eb;
        }

        .editor-content h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        .dark .editor-content h4 {
          color: #d1d5db;
        }

        .editor-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }

        .editor-content ul,
        .editor-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .editor-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }

        .editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 2rem auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .editor-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9em;
          color: #ef4444;
        }

        .dark .editor-content code {
          background-color: #374151;
          color: #fca5a5;
        }

        .editor-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .editor-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
          font-size: 0.875rem;
        }

        .editor-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
          background-color: #f9fafb;
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .dark .editor-content blockquote {
          color: #9ca3af;
          background-color: #1f2937;
          border-left-color: #60a5fa;
        }

        .editor-content a {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .editor-content a:hover {
          color: #2563eb;
        }

        .dark .editor-content a {
          color: #60a5fa;
        }

        .dark .editor-content a:hover {
          color: #3b82f6;
        }

        .editor-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .editor-content th,
        .editor-content td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          text-align: left;
        }

        .dark .editor-content th,
        .dark .editor-content td {
          border-color: #374151;
        }

        .editor-content th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #1f2937;
        }

        .dark .editor-content th {
          background-color: #374151;
          color: #f9fafb;
        }

        .editor-content tr:hover {
          background-color: #f9fafb;
        }

        .dark .editor-content tr:hover {
          background-color: #1f2937;
        }

        .editor-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 3rem 0;
        }

        .dark .editor-content hr {
          border-top-color: #374151;
        }

        .editor-content strong {
          font-weight: 700;
          color: #111827;
        }

        .dark .editor-content strong {
          color: #f9fafb;
        }

        .editor-content em {
          font-style: italic;
        }
      `}</style>
    </main>
  );
}
