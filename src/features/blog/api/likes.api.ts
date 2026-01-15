// src/features/blog/api/likes.api.ts
import { supabase } from "@/lib/supabase/client";

/**
 * Customer: like a post
 * Note: user_id is automatically set by RLS policy from auth.uid()
 */
export async function likePost(postId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    throw new Error("Not authenticated");
  }

  return supabase.from("post_likes").insert({
    post_id: postId,
    user_id: userData.user.id,
  });
}

/**
 * Get posts liked by the current customer with pagination
 * Returns posts with author information and like timestamp
 * @param limit - Number of posts to fetch (default: 20)
 * @param offset - Number of posts to skip (default: 0)
 * @returns Array of { liked_at, post: { ... } } and hasMore flag
 */
export async function getCustomerLikedPosts(
  limit = 20,
  offset = 0,
): Promise<{
  data: Array<{
    liked_at: string;
    post: {
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      featured_image_url: string | null;
      published_at: string;
      like_count: number;
      view_count: number;
      reading_time: number;
      author: {
        full_name: string;
        avatar_url: string | null;
      } | null;
    };
  }>;
  hasMore: boolean;
  total: number;
}> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!userData?.user?.id) throw new Error("Not authenticated");

  const userId = userData.user.id;

  // Get total count of likes for published posts only
  // Use inner join to only count likes for published posts
  const { count: totalLikes, error: countError } = await supabase
    .from("post_likes")
    .select("posts!inner(id)", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("posts.is_published", true)
    .not("posts.published_at", "is", null);

  if (countError) throw countError;
  const total = totalLikes || 0;

  // Get paginated likes with created_at (liked_at timestamp)
  const { data: likes, error: likesError } = await supabase
    .from("post_likes")
    .select("post_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (likesError) throw likesError;

  if (!likes || likes.length === 0) {
    return { data: [], hasMore: false, total };
  }

  const postIds = likes.map((like) => like.post_id);

  // Get posts with author information
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      featured_image_url,
      author_id,
      is_published,
      published_at,
      like_count,
      view_count,
      reading_time,
      author:profiles!posts_author_id_fkey (
        user_id,
        full_name,
        avatar_url
      )
    `,
    )
    .in("id", postIds)
    .eq("is_published", true)
    .not("published_at", "is", null);

  if (postsError) throw postsError;

  if (!posts || posts.length === 0) {
    // No published posts found - check if there are more likes available
    // If we got fewer likes than requested, we've reached the end
    // Otherwise, there might be more likes (some may be unpublished)
    const hasMore = likes.length >= limit && offset + limit < total;
    return { data: [], hasMore, total };
  }

  // Create a map of post_id -> liked_at for quick lookup
  const likedAtMap = new Map(
    likes.map((like) => [like.post_id, like.created_at]),
  );

  // Transform to match expected structure: { liked_at, post: { author: {...} } }
  const transformed = posts
    .map((post) => {
      const likedAt = likedAtMap.get(post.id);
      if (!likedAt) return null; // Should not happen, but safety check

      // Handle author - profiles is an array from Supabase join
      const authorProfile = Array.isArray(post.author)
        ? post.author[0]
        : post.author;

      return {
        liked_at: likedAt,
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          featured_image_url: post.featured_image_url,
          published_at: post.published_at || "",
          like_count: post.like_count,
          view_count: post.view_count,
          reading_time: post.reading_time || 0,
          author: authorProfile
            ? {
                full_name: authorProfile.full_name,
                avatar_url: authorProfile.avatar_url,
              }
            : null,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort(
      (a, b) => new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime(),
    ); // Sort by liked_at desc

  // hasMore should be based on whether there are more published posts available
  // Use the corrected total (only published posts) to determine if there are more
  const hasMore = offset + transformed.length < total;

  return { data: transformed, hasMore, total };
}

/**
 * Get post IDs liked by the current user
 */
export async function getCustomerLikedPostIds() {
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user?.id) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userData.user.id);

  if (error) throw error;

  const postIds = data?.map((like) => like.post_id) || [];

  return postIds;
}

/**
 * Customer: unlike a post
 * Note: RLS policy ensures user can only delete their own likes
 */
export async function unlikePost(postId: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user?.id) {
    throw new Error("Not authenticated");
  }

  return supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userData.user.id);
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
