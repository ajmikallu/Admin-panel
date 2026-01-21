import { useEffect, useState, useCallback, useMemo } from "react";
import { getApprovedComments } from "@/features/blog/api/comments.api";
import type { Comment } from "@/types/blog.types";
import CommentItem from "@/components/blog/comment/CommentItem";
import CommentForm from "@/components/blog/comment/CommentForm";
import { useProfile } from "@/hooks/useProfile";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

type BlogCommentsProps = {
  postId: string;
};

/**
 * Build a nested comment tree from flat comments
 */
export function buildCommentTree(comments: Comment[]) {
  const map = new Map<string, Comment & { replies: Comment[] }>();
  const roots: (Comment & { replies: Comment[] })[] = [];

  // Initialize
  comments.forEach((c) => {
    map.set(c.id, { ...c, replies: [] });
  });

  // Build tree
  comments.forEach((c) => {
    const node = map.get(c.id)!;

    if (c.parent_id) {
      const parent = map.get(c.parent_id);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { permissions } = useProfile();

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getApprovedComments(postId);

      const mapped: Comment[] = (data || []).map((c: any) => ({
        id: c.id,
        post_id: c.post_id,
        user_id: c.user_id,
        parent_id: c.parent_id ?? null,
        content: c.content,
        status: c.status,
        like_count: c.like_count,
        created_at: c.created_at,
        updated_at: c.updated_at,
        profile: c.profile ?? undefined,
      }));

      setComments(mapped);
    } catch (err) {
      logger.error(err, "Failed to load comments");
      toast.error("Failed to load comments");
      setError("Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ✅ Build tree ONCE (memoized)
  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  /* ------------------ UI STATES ------------------ */

  if (loading) {
    return (
      <section className="mt-10">
        <h3 className="mb-4 text-xl font-semibold">Comments</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h3 className="mb-6 text-xl font-semibold">Comments</h3>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20">
          {error}
          <button
            onClick={loadComments}
            className="ml-2 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Comment Form */}
      {permissions.canComment ? (
        <CommentForm postId={postId} onSuccess={loadComments} />
      ) : (
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20">
          Login as a customer to take part in the discussion.
        </div>
      )}

      {/* Comment List */}
      {commentTree.length === 0 ? (
        <div className="mt-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            💬
          </div>
          <h4 className="mb-1 text-lg font-medium">No comments yet</h4>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              postId={postId}
              comment={comment}
              onRefresh={loadComments}
            />
          ))}
        </div>
      )}
    </section>
  );
}
