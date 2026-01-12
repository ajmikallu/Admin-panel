// src/features/blog/api/comments.api.ts
import { supabase } from "@/lib/supabase/client";
// import type { Comment } from "@/types/blog.types";

/**
 * Public: get approved comments for a post
 */
export async function getApprovedComments(postId: string) {
  return supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
}

/**
 * Customer: create comment (status = pending)
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string,
) {
  return supabase.from("comments").insert({
    post_id: postId,
    content,
    parent_id: parentId ?? null,
  });
}

/**
 * Customer: update own comment
 */
export async function updateComment(commentId: string, content: string) {
  return supabase.from("comments").update({ content }).eq("id", commentId);
}

/**
 * Customer: delete own comment
 */
export async function deleteComment(commentId: string) {
  return supabase.from("comments").delete().eq("id", commentId);
}

/**
 * Admin: moderate comment
 */
export async function moderateComment(
  commentId: string,
  status: "approved" | "rejected" | "spam",
) {
  return supabase.from("comments").update({ status }).eq("id", commentId);
}
