import { useState } from "react";
import { createComment } from "@/features/blog/api/comments.api";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
}: {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { permissions } = useProfile();

  const submit = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      await createComment(postId, content, parentId);
      setContent("");
      onSuccess();
    } catch (error) {
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <textarea
        className="w-full border p-2"
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        className="pointer mt-1 border px-3 py-1"
        onClick={submit}
        disabled={loading || !permissions.canComment}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
