// src/features/blog/api/comments.api.ts
import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

/**
 * Public: get approved comments for a post
 */
export async function getApprovedComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      posts!comments_post_id_fkey(id, title),
      profile:profiles!comments_user_id_fkey(
        full_name, 
        avatar_url, 
        role, 
        country, 
        phone
      )
    `,
    )
    .eq("post_id", postId)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Customer: create comment (status = pending)
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to comment");
  }

  // 🔒 Fetch role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "customer") {
    throw new Error("Only customers can comment");
  }

  return supabase.from("comments").insert({
    post_id: postId,
    content,
    parent_id: parentId ?? null,
    status: "pending",
    user_id: user.id,
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
 * Admin: moderate a comment (approve, reject, spam)
 */
export async function moderateComment(
  commentId: string,
  status: "approved" | "rejected" | "spam",
) {
  return supabase.from("comments").update({ status }).eq("id", commentId);
}

/**
 * Admin: get all comments with post and user info
 * Optional filter by status
 */
export async function getAllCommentsAdmin(status?: string) {
  let query = supabase
    .from("comments")
    .select(
      `
      *,
      posts!comments_post_id_fkey(id, title),
      profile:profiles!comments_user_id_fkey(full_name, avatar_url, role, country, phone)
    `,
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  return query;
}

/**
 * Admin: approve multiple comments at once (bulk moderation)
 */
export async function bulkModerateComments(
  commentIds: string[],
  status: "approved" | "rejected" | "spam",
) {
  return supabase.from("comments").update({ status }).in("id", commentIds);
}
