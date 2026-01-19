// src/features/blog/api/likes.api.ts
import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

/**
 * ========================================
 * HELPER: Get authenticated user
 * ========================================
 * DRY principle - don't repeat auth logic
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
 * Like a post
 * ========================================
 * Best practices:
 * ✅ Centralized auth helper
 * ✅ Error logging with context
 * ✅ Returns the created record
 */
export async function likePost(postId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log({ userId: user.id, postId }, "Attempting to like post");

    const { data, error } = await supabase
      .from("post_likes")
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate like (unique constraint violation)
      if (error.code === "23505") {
        logger.warn({ userId: user.id, postId }, "Post already liked");
        throw new Error("You have already liked this post");
      }
      
      logger.error({ error, userId: user.id, postId }, "Failed to like post");
      throw error;
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
 * Best practices:
 * ✅ Centralized auth helper
 * ✅ Error logging
 * ✅ Returns success status
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
      throw error;
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
 * Check if user has liked a post
 * ========================================
 * Best practices:
 * ✅ Returns boolean (simpler API)
 * ✅ Uses .maybeSingle() to avoid errors
 * ✅ Fast check query (only needs ID)
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

    return !!data; // Returns true/false instead of data object

  } catch (error) {
    logger.error({ error, postId, userId }, "Error in hasLikedPost");
    throw error;
  }
}

/**
 * ========================================
 * Get all post IDs liked by current user
 * ========================================
 * Best practices:
 * ✅ Single query (no join needed for IDs only)
 * ✅ Centralized auth
 * ✅ Error logging
 * ✅ Returns Set for O(1) lookups
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
 * Get paginated liked posts (BEST PRACTICE)
 * ========================================
 * 
 * IMPROVEMENTS FROM ORIGINAL:
 * ✅ Single query instead of 3 (3x faster!)
 * ✅ Database-side sorting (not in-memory)
 * ✅ No pagination gaps from unpublished posts
 * ✅ Comprehensive error logging
 * ✅ Centralized auth helper
 * ✅ Better error messages
 * ✅ Type-safe response
 * 
 * @param limit - Number of posts per page (default: 20)
 * @param offset - Offset for pagination (default: 0)
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

    // ✅ SINGLE QUERY with JOIN - Best Practice!
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

    // Early return if no data
    if (!likedPosts || likedPosts.length === 0) {
      logger.log({ userId: user.id, total }, "No liked posts found");
      return { data: [], hasMore: false, total };
    }

    // Transform data to expected structure
    // Note: Database already sorted, no need for .sort()!
    const transformed = likedPosts.map((item) => {
      // Supabase join returns posts as object (not array) due to !inner
      const post = item.posts as any;
      
      // Handle author join (might be array or object depending on Supabase version)
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

    // Calculate if there are more results
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
 * ALTERNATIVE: Get liked posts with retry logic
 * ========================================
 * 
 * Use this version if you want to ALWAYS return exactly `limit` items
 * even when some liked posts have been unpublished.
 * 
 * Trade-off: Slightly more complex, may make 2-3 queries in rare cases
 * Benefit: Guarantees consistent pagination UX
 */
export async function getCustomerLikedPostsWithRetry(
  limit = 20,
  offset = 0,
  maxAttempts = 3,
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
    
    let currentOffset = offset;
    let fetchLimit = limit;
    let allResults: any[] = [];
    let attempts = 0;
    let total = 0;

    logger.log(
      { userId: user.id, limit, offset },
      "Fetching liked posts with retry logic"
    );

    // Keep fetching until we have enough results or run out of data
    while (allResults.length < limit && attempts < maxAttempts) {
      const { data: likedPosts, count } = await supabase
        .from("post_likes")
        .select(
          `
          created_at,
          posts!inner (
            id, title, slug, excerpt, featured_image_url,
            published_at, like_count, view_count, reading_time,
            is_published,
            author:profiles!posts_author_id_fkey (full_name, avatar_url)
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", user.id)
        .eq("posts.is_published", true)
        .not("posts.published_at", "is", null)
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + fetchLimit - 1);

      total = count ?? 0;

      if (!likedPosts || likedPosts.length === 0) break;

      allResults = [...allResults, ...likedPosts];

      // If we got fewer results than requested, we've hit the end
      if (likedPosts.length < fetchLimit) break;

      // Move to next batch
      currentOffset += fetchLimit;
      fetchLimit = Math.min(limit - allResults.length, limit);
      attempts++;

      logger.log(
        { attempt: attempts, fetched: allResults.length, target: limit },
        "Retry fetch iteration"
      );
    }

    // Trim to exact limit
    const finalResults = allResults.slice(0, limit);

    const transformed = finalResults.map((item) => {
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
        attempts,
      },
      "Successfully fetched liked posts with retry"
    );

    return { data: transformed, hasMore, total };

  } catch (error) {
    logger.error(
      { error, limit, offset },
      "Error in getCustomerLikedPostsWithRetry"
    );
    throw error;
  }
}

/**
 * ========================================
 * BATCH OPERATIONS (BONUS)
 * ========================================
 */

/**
 * Like multiple posts at once (bulk operation)
 * Useful for "like all" or import features
 */
export async function likePosts(postIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log(
      { userId: user.id, count: postIds.length },
      "Bulk liking posts"
    );

    const likes = postIds.map((postId) => ({
      post_id: postId,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("post_likes")
      .insert(likes)
      .select();

    if (error) {
      logger.error({ error, userId: user.id }, "Failed to bulk like posts");
      throw error;
    }

    logger.log(
      { userId: user.id, liked: data?.length },
      "Bulk like successful"
    );
    
    return { data, error: null };

  } catch (error) {
    logger.error({ error }, "Error in likePosts");
    throw error;
  }
}

/**
 * Unlike multiple posts at once (bulk operation)
 */
export async function unlikePosts(postIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    
    logger.log(
      { userId: user.id, count: postIds.length },
      "Bulk unliking posts"
    );

    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("user_id", user.id)
      .in("post_id", postIds);

    if (error) {
      logger.error({ error, userId: user.id }, "Failed to bulk unlike posts");
      throw error;
    }

    logger.log({ userId: user.id, count: postIds.length }, "Bulk unlike successful");
    return { error: null };

  } catch (error) {
    logger.error({ error }, "Error in unlikePosts");
    throw error;
  }
}

/**
 * ========================================
 * DATABASE INDEXES (CRITICAL FOR PERFORMANCE!)
 * ========================================
 * 
 * Run these in your Supabase SQL editor:
 * 
 * -- Index for user's likes (most important!)
 * CREATE INDEX IF NOT EXISTS idx_post_likes_user_created 
 *   ON post_likes(user_id, created_at DESC);
 * 
 * -- Index for post like lookups
 * CREATE INDEX IF NOT EXISTS idx_post_likes_post_user 
 *   ON post_likes(post_id, user_id);
 * 
 * -- Index for published posts
 * CREATE INDEX IF NOT EXISTS idx_posts_published 
 *   ON posts(is_published, published_at DESC) 
 *   WHERE is_published = true AND published_at IS NOT NULL;
 * 
 * -- Index for author joins
 * CREATE INDEX IF NOT EXISTS idx_posts_author 
 *   ON posts(author_id);
 * 
 * -- Unique constraint (prevent duplicate likes)
 * ALTER TABLE post_likes 
 *   ADD CONSTRAINT unique_user_post_like 
 *   UNIQUE (user_id, post_id);
 * 
 * These indexes will make queries 10-100x faster!
 */