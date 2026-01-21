import type { PostView } from "@/types/blog.types";
import { useBlogLike } from "@/hooks/useBlogLike";

export function BlogEngagement({ post }: { post: PostView }) {
  const { isLiked, likeCount, toggle } = useBlogLike(
    post.id,
    post.like_count || 0,
  );

  return (
    <div className="mt-12 flex items-center gap-6 border-t px-4 pt-6">
      <button
        onClick={toggle}
        className={isLiked ? "text-red-600" : "text-gray-600"}
      >
        ❤️ {likeCount}
      </button>

      <span>💬 {post.comment_count || 0}</span>
    </div>
  );
}
