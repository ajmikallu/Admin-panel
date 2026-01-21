import type { PostView } from "@/types/blog.types";

type Props = {
  post: PostView;
};

export function BlogHeader({ post }: Props) {
  return (
    <>
      {/* Pinned */}
      {post.is_pinned && (
        <div className="mb-4 px-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800">
            📌 Pinned Post
          </span>
        </div>
      )}

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="mb-8 overflow-hidden rounded-xl px-4">
          <img
            src={post.featured_image_url}
            alt={post.featured_image_alt || post.title}
            className="w-full rounded-xl object-cover shadow-lg"
            loading="lazy"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="mb-6 px-4 text-4xl font-bold md:text-5xl">{post.title}</h1>
    </>
  );
}
