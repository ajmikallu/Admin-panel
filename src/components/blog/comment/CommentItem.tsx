import { useState } from "react";
import type { Comment } from "@/types/blog.types";
import { updateComment, deleteComment } from "@/features/blog/api/comments.api";
import CommentForm from "./CommentForm";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

type Props = {
  comment: Comment & { replies?: Comment[] };
  postId: string;
  onRefresh: () => Promise<void>;
};

export default function CommentItem({ comment, postId, onRefresh }: Props) {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);

  const [content, setContent] = useState(comment.content);

  const { profile } = useProfile();
  const isOwner = profile?.user_id === comment.user_id;

  /* ---------- ACTIONS ---------- */
  const saveEdit = async () => {
    if (!content.trim()) return;
    try {
      await updateComment(comment.id, content);
      setEditing(false);
      await onRefresh();
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const remove = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(comment.id);
      await onRefresh();
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="space-y-2">
      {/* Comment Box */}
      <div className="rounded-lg border p-4">
        {/* Author */}
        <div className="text-sm font-medium">
          {comment.profile?.full_name || "Anonymous"}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {new Date(comment.created_at).toLocaleString()}
        </div>

        {/* Content / Edit */}
        {!editing ? (
          <p className="mt-2">{comment.content}</p>
        ) : (
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full rounded border p-2 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex gap-2 text-sm">
              <button onClick={saveEdit} className="font-medium text-blue-600">
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setContent(comment.content);
                }}
                className="text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-4 text-sm">
          <button onClick={() => setReplying(!replying)}>Reply</button>
          {isOwner && (
            <>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={remove} className="text-red-600">
                Delete
              </button>
            </>
          )}
        </div>
        {replying && (
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => {
              setReplying(false);
              onRefresh();
            }}
          />
        )}
      </div>

      {/* Replies (Recursive) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-6 space-y-3 border-l pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
