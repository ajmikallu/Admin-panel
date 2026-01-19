// src/features/blog/api/likes.api.ts
import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

/**
 * ========================================
 * HELPER: Get authenticated user
 * ========================================
 */
async function getAuthenticatedUser() {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    logger.error({ error: authError }, "Authentication error");
    throw new Error("Authentication failed");
  }
  
  if (!userData?.user?.id) {
    logger.warn("Unauthenticated access attempt");
    throw new Error("Not authenticated");
  }
  
  return userData.user;
}

/**
 * ========================================
 * Like a post (IDEMPOTENT - safe to call multiple times)
 * ========================================
 * 
 * This function uses upsert to make liking idempotent.
 * Calling it multiple times will NOT cause errors.
 * 
 * @param postId - ID of the post to like
 * @returns Success response (never throws on duplicate)
 */
export async function likePost(postId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log({ userId: user.id, postId }, "Attempting to like post");

    // UPSERT approach: Never fails on duplicates
    const { data, error } = await supabase
      .from("post_likes")
      .upsert(
        {
          post_id: postId,
          user_id: user.id,
        },
        {
          onConflict: "user_id,post_id",
        }
      )
      .select()
      .maybeSingle();

    if (error) {
      logger.error({ error, userId: user.id, postId }, "Failed to like post");
      throw new Error("Failed to like post");
    }

    logger.log({ userId: user.id, postId }, "Post liked successfully");
    return { data, error: null };

  } catch (error) {
    logger.error({ error, postId }, "Error in likePost");
    throw error;
  }
}

/**
 * ========================================
 * Unlike a post
 * ========================================
 */
export async function unlikePost(postId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log({ userId: user.id, postId }, "Attempting to unlike post");

    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      logger.error({ error, userId: user.id, postId }, "Failed to unlike post");
      throw new Error("Failed to unlike post");
    }

    logger.log({ userId: user.id, postId }, "Post unliked successfully");
    return { error: null };

  } catch (error) {
    logger.error({ error, postId }, "Error in unlikePost");
    throw error;
  }
}

/**
 * ========================================
 * Toggle like (recommended for UI)
 * ========================================
 * 
 * This is the BEST function to use from your React components.
 * It handles both like and unlike in a single function.
 * 
 * @param postId - ID of the post
 * @param currentlyLiked - Whether the post is currently liked
 * @returns Object with new like status
 */
export async function togglePostLike(postId: string, currentlyLiked: boolean) {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log(
      { userId: user.id, postId, currentlyLiked },
      "Toggling post like"
    );

    if (currentlyLiked) {
      // Unlike the post
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        logger.error({ error, userId: user.id, postId }, "Failed to unlike");
        throw new Error("Failed to unlike post");
      }

      logger.log({ userId: user.id, postId }, "Post unliked");
      return { isLiked: false, error: null };
    } else {
      // Like the post (upsert is idempotent)
      const { error } = await supabase
        .from("post_likes")
        .upsert(
          {
            post_id: postId,
            user_id: user.id,
          },
          {
            onConflict: "user_id,post_id",
          }
        );

      if (error) {
        logger.error({ error, userId: user.id, postId }, "Failed to like");
        throw new Error("Failed to like post");
      }

      logger.log({ userId: user.id, postId }, "Post liked");
      return { isLiked: true, error: null };
    }
  } catch (error) {
    logger.error({ error, postId }, "Error in togglePostLike");
    throw error;
  }
}

/**
 * ========================================
 * Check if user has liked a post
 * ========================================
 */
export async function hasLikedPost(postId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error({ error, postId, userId }, "Error checking like status");
      throw error;
    }

    return !!data;

  } catch (error) {
    logger.error({ error, postId, userId }, "Error in hasLikedPost");
    throw error;
  }
}

/**
 * ========================================
 * Get all post IDs liked by current user
 * ========================================
 */
export async function getCustomerLikedPostIds(): Promise<Set<string>> {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log({ userId: user.id }, "Fetching liked post IDs");

    const { data, error } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);

    if (error) {
      logger.error({ error, userId: user.id }, "Failed to fetch liked post IDs");
      throw error;
    }

    const postIds = new Set(data?.map((like) => like.post_id) || []);
    
    logger.log({ userId: user.id, count: postIds.size }, "Fetched liked post IDs");
    
    return postIds;

  } catch (error) {
    logger.error({ error }, "Error in getCustomerLikedPostIds");
    throw error;
  }
}

/**
 * ========================================
 * Get paginated liked posts (SINGLE QUERY - BEST PRACTICE)
 * ========================================
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
  try {
    const user = await getAuthenticatedUser();
    
    logger.log({ userId: user.id, limit, offset }, "Fetching liked posts");

    // SINGLE QUERY with JOIN
    const { data: likedPosts, error, count } = await supabase
      .from("post_likes")
      .select(
        `
        created_at,
        posts!inner (
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          published_at,
          like_count,
          view_count,
          reading_time,
          is_published,
          author:profiles!posts_author_id_fkey (
            full_name,
            avatar_url
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .eq("posts.is_published", true)
      .not("posts.published_at", "is", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error(
        { error, userId: user.id, limit, offset },
        "Database error fetching liked posts"
      );
      throw new Error("Failed to fetch liked posts");
    }

    const total = count ?? 0;

    if (!likedPosts || likedPosts.length === 0) {
      logger.log({ userId: user.id, total }, "No liked posts found");
      return { data: [], hasMore: false, total };
    }

    const transformed = likedPosts.map((item) => {
      const post = item.posts as any;
      const authorProfile = Array.isArray(post.author)
        ? post.author[0]
        : post.author;

      return {
        liked_at: item.created_at,
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          featured_image_url: post.featured_image_url,
          published_at: post.published_at || "",
          like_count: post.like_count || 0,
          view_count: post.view_count || 0,
          reading_time: post.reading_time || 0,
          author: authorProfile
            ? {
                full_name: authorProfile.full_name || "Unknown Author",
                avatar_url: authorProfile.avatar_url,
              }
            : null,
        },
      };
    });

    const hasMore = offset + transformed.length < total;

    logger.log(
      {
        userId: user.id,
        returned: transformed.length,
        total,
        hasMore,
        offset,
      },
      "Successfully fetched liked posts"
    );

    return { data: transformed, hasMore, total };

  } catch (error) {
    logger.error({ error, limit, offset }, "Error in getCustomerLikedPosts");
    throw error;
  }
}

/**
 * ========================================
 * BULK OPERATIONS
 * ========================================
 */

/**
 * Like multiple posts at once (IDEMPOTENT)
 * Safely handles duplicates - will not fail if posts are already liked
 */
export async function likePosts(postIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!postIds || postIds.length === 0) {
      logger.warn({ userId: user.id }, "Bulk like called with empty array");
      return { newLikes: 0, total: 0 };
    }

    logger.log(
      { userId: user.id, count: postIds.length },
      "Bulk liking posts"
    );

    const likes = postIds.map((postId) => ({
      post_id: postId,
      user_id: user.id,
    }));

    // Upsert handles duplicates gracefully
    const { data, error } = await supabase
      .from("post_likes")
      .upsert(likes, {
        onConflict: "user_id,post_id",
        ignoreDuplicates: true,
      })
      .select();

    if (error) {
      logger.error({ error, userId: user.id }, "Failed to bulk like posts");
      throw new Error("Failed to like posts");
    }

    const newLikes = data?.length || 0;

    logger.log(
      { 
        userId: user.id, 
        newLikes, 
        total: postIds.length 
      },
      "Bulk like completed"
    );
    
    return { 
      newLikes, 
      total: postIds.length,
      data 
    };

  } catch (error) {
    logger.error({ error }, "Error in likePosts");
    throw error;
  }
}

/**
 * Unlike multiple posts at once
 */
export async function unlikePosts(postIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!postIds || postIds.length === 0) {
      return { count: 0 };
    }

    logger.log(
      { userId: user.id, count: postIds.length },
      "Bulk unliking posts"
    );

    const { error, count } = await supabase
      .from("post_likes")
      .delete({ count: "exact" })
      .eq("user_id", user.id)
      .in("post_id", postIds);

    if (error) {
      logger.error({ error, userId: user.id }, "Failed to bulk unlike posts");
      throw new Error("Failed to unlike posts");
    }

    logger.log({ userId: user.id, count }, "Bulk unlike successful");
    return { count: count || 0 };

  } catch (error) {
    logger.error({ error }, "Error in unlikePosts");
    throw error;
  }
}

/**
 * ========================================
 * DATABASE SETUP (Run in Supabase SQL Editor)
 * ========================================
 * 
 * -- Create unique constraint (REQUIRED for upsert)
 * ALTER TABLE post_likes 
 *   ADD CONSTRAINT unique_user_post_like 
 *   UNIQUE (user_id, post_id);
 * 
 * -- Performance indexes
 * CREATE INDEX IF NOT EXISTS idx_post_likes_user_created 
 *   ON post_likes(user_id, created_at DESC);
 * 
 * CREATE INDEX IF NOT EXISTS idx_post_likes_post_user 
 *   ON post_likes(post_id, user_id);
 * 
 * CREATE INDEX IF NOT EXISTS idx_posts_published 
 *   ON posts(is_published, published_at DESC) 
 *   WHERE is_published = true AND published_at IS NOT NULL;
 */