import { useEffect, useState } from "react";
import {
  getApprovedComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/features/blog/api/comments.api";
import { toast } from "sonner";
import type { Comment } from "@/types/blog.types";

export function useBlogComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
  
    async function load() {
      setLoading(true);
  
      try {
        const data = await getApprovedComments(postId);
        setComments(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load comments");
        setComments([]);
      } finally {
        setLoading(false);
      }
    }
  
    load();
  }, [postId]);
  

  const addComment = async (content: string, parentId?: string) => {
    try {
      const { error } = await createComment(postId, content, parentId);
      if (error) {
        toast.error("Failed to submit comment");
        return;
      }
      toast.success("Comment submitted for approval");
    } catch {
      toast.error("Failed to submit comment");
    }
  };

  const editComment = async (id: string, content: string) => {
    try {
      const { error } = await updateComment(id, content);
      if (error) {
        toast.error("Update failed");
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, content } : c)),
        );
        toast.success("Comment updated");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const removeComment = async (id: string) => {
    try {
      const { error } = await deleteComment(id);
      if (error) {
        toast.error("Delete failed");
      } else {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("Comment deleted");
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  return {
    comments,
    loading,
    addComment,
    editComment,
    removeComment,
  };
}
