import type { PostView } from "@/types/blog.types";

export function BlogMeta({ post }: { post: PostView }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-4 border-b px-4 pb-6 text-sm text-gray-600">
      {post.published_at && (
        <time>{new Date(post.published_at).toLocaleDateString()}</time>
      )}

      {post.reading_time && <span>{post.reading_time} min read</span>}

      {post.view_count > 0 && (
        <span>{post.view_count.toLocaleString()} views</span>
      )}

      {post.category && (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
          {post.category.name}
        </span>
      )}

      {post.is_featured && (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
          ⭐ Featured
        </span>
      )}
    </div>
  );
}
