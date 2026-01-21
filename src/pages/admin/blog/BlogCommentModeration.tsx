import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import {
  getAllCommentsAdmin,
  moderateComment,
} from "@/features/blog/api/comments.api";
import { logger } from "@/lib/logger";

type CommentType = {
  id: string;
  content: string;
  status: string;
  created_at: string;
  parent_id?: string | null;
  like_count: number;
  posts: { id: string; title: string } | null;
  profile?: { full_name?: string; email?: string; role?: string } | null;
};

export default function BlogCommentModeration() {
  const { profile, loading: profileLoading } = useProfile();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "pending" | "approved" | "rejected" | "spam" | "all"
  >("pending");

  useEffect(() => {
    // Only load comments if profile is ready and user is admin/superAdmin
    if (
      !profileLoading &&
      ["admin", "superAdmin"].includes(profile?.role || "")
    ) {
      loadComments();
    }
  }, [filter, profileLoading, profile?.role]);

  if (profileLoading) return <p>Loading...</p>;
  if (!["admin", "superAdmin"].includes(profile?.role || "")) {
    return <p>Access denied. Admin or SuperAdmin privileges required.</p>;
  }

  async function loadComments() {
    setLoading(true);

    try {
      const statusFilter = filter === "all" ? undefined : filter;
      const { data, error } = await getAllCommentsAdmin(statusFilter);
      logger.log(data);

      if (error) {
        console.error("Failed to load comments:", error);
        alert("Failed to load comments");
        setComments([]); // clear previous comments on error
        return;
      }

      const mapped: CommentType[] =
        (data || []).map((c: any) => ({
          id: c.id,
          content: c.content,
          status: c.status,
          created_at: c.created_at,
          parent_id: c.parent_id,
          like_count: c.like_count,
          posts: c.posts || { id: "", title: "" },
          profile: c.profile || {},
        })) || [];

      setComments(mapped);
    } catch (err) {
      console.error("Unexpected error loading comments:", err);
      alert("Failed to load comments due to unexpected error");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleModerate(
    commentId: string,
    status: "approved" | "rejected" | "spam",
  ) {
    const confirmMsg = `Are you sure you want to mark this comment as ${status}?`;
    if (!window.confirm(confirmMsg)) return;

    const { error } = await moderateComment(commentId, status);
    if (error) {
      alert("Failed to update status");
      return;
    }

    // Optimistic refresh
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status } : c)),
    );
  }

  if (loading) return <p>Loading comments...</p>;
  //   logger.log(comments);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Blog Comment Moderation</h1>

      {/* Filter */}
      <div className="mb-4 space-x-2">
        {["pending", "approved", "rejected", "spam", "all"].map((f) => (
          <button
            key={f}
            className={`rounded px-3 py-1 ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Post</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Comment</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Created</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="border p-2">{c.posts?.title}</td>
              <td className="border p-2">
                {c.profile?.full_name || c.profile?.email || "Anonymous"}
              </td>
              <td className="border p-2">{c.content}</td>
              <td className="border p-2">{c.status}</td>
              <td className="border p-2">
                {new Date(c.created_at).toLocaleString()}
              </td>
              <td className="flex gap-1 border p-2">
                {c.status !== "approved" && (
                  <button
                    className="rounded bg-green-500 px-2 py-1 text-white"
                    onClick={() => handleModerate(c.id, "approved")}
                  >
                    Approve
                  </button>
                )}
                {c.status !== "rejected" && (
                  <button
                    className="rounded bg-red-500 px-2 py-1 text-white"
                    onClick={() => handleModerate(c.id, "rejected")}
                  >
                    Reject
                  </button>
                )}
                {c.status !== "spam" && (
                  <button
                    className="rounded bg-gray-500 px-2 py-1 text-white"
                    onClick={() => handleModerate(c.id, "spam")}
                  >
                    Spam
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
