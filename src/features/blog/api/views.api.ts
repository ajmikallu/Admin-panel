// src/features/blog/api/views.api.ts
import { supabase } from "@/lib/supabase/client";

/**
 * Track post view (fire & forget)
 */
export async function trackPostView(postId: string, userId?: string) {
  return supabase.from("post_views").insert({
    post_id: postId,
    user_id: userId ?? null,
  });
}
