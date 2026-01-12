// src/features/blog/api/likes.api.ts
import { supabase } from "@/lib/supabase/client";

/**
 * Customer: like a post
 */
export async function likePost(postId: string) {
  return supabase.from("post_likes").insert({ post_id: postId });
}

/**
 * Customer: unlike a post
 */
export async function unlikePost(postId: string) {
  return supabase.from("post_likes").delete().eq("post_id", postId);
}

/**
 * Check if user already liked post
 */
export async function hasLikedPost(postId: string, userId: string) {
  return supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
}
