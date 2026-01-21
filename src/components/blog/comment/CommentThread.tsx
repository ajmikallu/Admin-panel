// components/blog/comment/CommentThread.tsx

import { useEffect, useState, useCallback } from "react";
import { getApprovedComments } from "@/features/blog/api/comments.api";
import type { Comment } from "@/types/blog.types";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { buildCommentTree } from "@/utils/comments";
import { useProfile } from "@/hooks/useProfile";

type Props = {
  postId: string;
};

export default function CommentThread({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { permissions } = useProfile();

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getApprovedComments(postId);

      // ✅ trust API but still safe-map
      const mapped: Comment[] = (data || []).map((c: any) => ({
        id: c.id,
        post_id: c.post_id,
        user_id: c.user_id,
        parent_id: c.parent_id,
        content: c.content,
        status: c.status,
        like_count: c.like_count,
        created_at: c.created_at,
        updated_at: c.updated_at,
        profile: c.profile,
        posts: c.posts,
      }));

      setComments(mapped);
    } catch (err) {
      setError("Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (loading) {
    return <div className="mt-6 text-gray-500">Loading comments…</div>;
  }

  const tree = buildCommentTree(comments);

  return (
    <section className="mt-10">
      <h3 className="mb-6 text-xl font-semibold">Comments</h3>

      {/* Comment Form */}
      {permissions.canComment ? (
        <CommentForm postId={postId} onSuccess={loadComments} />
      ) : (
        <p className="mb-4 text-sm text-gray-500">
          Login to join the discussion.
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {tree.length === 0 ? (
        <p className="mt-6 text-gray-500">No comments yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {tree.map((comment) => (
            <CommentNode key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  );
}

/* Recursive node */
function CommentNode({
  comment,
}: {
  comment: Comment & { replies?: Comment[] };
}) {
  return (
    <CommentItem comment={comment}>
      {comment.replies?.map((reply) => (
        <CommentNode key={reply.id} comment={reply} />
      ))}
    </CommentItem>
  );
}
