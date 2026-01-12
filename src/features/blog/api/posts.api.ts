import { supabase } from "@/lib/supabase/client";
import type { Post } from "@/types/blog.types";
/**
 * Public: get all published posts (paginated)
 */
export async function getPublishedPosts(
  page = 1,
  pageSize = 10,
  limit?: number,
) {
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!inner(
        user_id,
        full_name,
        avatar_url
      ),
      category:categories(
        id,
        name,
        slug
      )
    `,
      { count: "exact" },
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  // If limit is provided → ignore pagination
  if (typeof limit === "number") {
    query = query.limit(limit);
  } else {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  return query;
}

/**
 * Public: get all posts (paginated)
 */
export async function getAllPostsAdmin(page = 1, pageSize = 10) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  return supabase.from("posts").select("*", { count: "exact" }).range(from, to);
}

/**
 * Public: get single post by slug
 */
export async function getPostBySlug(slug: string) {
  return supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!inner(
        user_id,
        full_name,
        avatar_url
      ),
      category:categories(
        id,
        name,
        slug
      )
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
}

/**
 * Staff: create post (draft or published)
 */
export async function createPost(data: Partial<Post>) {
  return supabase.from("posts").insert(data).select().single();
}

/**
 * Staff: update post
 */
export async function updatePost(postId: string, data: Partial<Post>) {
  if (data.featured_image_url) {
    const { data: oldPost } = await supabase
      .from("posts")
      .select("featured_image_url")
      .eq("id", postId)
      .single();

    // Delete old image if it's different from new one
    if (
      oldPost?.featured_image_url &&
      oldPost.featured_image_url !== data.featured_image_url
    ) {
      await deleteImageFromStorage(oldPost.featured_image_url);
    }
  }
  return supabase.from("posts").update(data).eq("id", postId).select().single();
}

/**
 * Helper: Extract file path from Supabase Storage URL
 */
function extractFilePathFromUrl(url: string): string | null {
  try {
    // Example URL: https://xxx.supabase.co/storage/v1/object/public/blog-images/posts/user-123.jpg
    const urlParts = url.split("/blog-images/");
    if (urlParts.length > 1) {
      return urlParts[1];
    }
    return null;
  } catch (error) {
    console.error("Error extracting file path:", error);
    return null;
  }
}

/**
 * Helper: Delete image from Supabase Storage
 */
export async function deleteImageFromStorage(
  imageUrl: string | null,
): Promise<boolean> {
  if (!imageUrl) return true;

  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.warn("Could not extract file path from URL:", imageUrl);
      return false;
    }

    const { error } = await supabase.storage
      .from("blog-images")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image from storage:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteImageFromStorage:", error);
    return false;
  }
}

/**
 * Admin: delete post and its featured image
 */
export async function deletePost(postId: string) {
  // First, get the post to find the image URL
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("featured_image_url")
    .eq("id", postId)
    .single();

  if (fetchError) {
    console.error("Error fetching post:", fetchError);
    return { data: null, error: fetchError };
  }

  // Delete the image from storage if it exists
  if (post?.featured_image_url) {
    await deleteImageFromStorage(post.featured_image_url);
    // Note: We continue even if image deletion fails
    // The post will still be deleted from the database
  }
  // console.log(post);
  // return;

  // Delete the post from database
  return supabase.from("posts").delete().eq("id", postId);
}

/**
 *
 * @param file
 * @param userId
 * @returns
 */
export async function uploadPostImage(
  file: File,
  userId: string,
): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${ext}`;
  const filePath = `posts/${fileName}`;

  const { error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("blog-images").getPublicUrl(filePath);

  return data.publicUrl;
}

/** Public: get related posts by category (excluding current post)
 */
export async function getRelatedPosts(postId: string, categoryId: string) {
  return supabase
    .from("posts")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .neq("id", postId)
    .limit(3);
}

/**
 * Public: get latest featured post
 */
export async function getLatestFeaturedPost() {
  return supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles!inner(
        user_id,
        full_name,
        avatar_url
      ),
      category:categories(
        id,
        name,
        slug
      )
    `,
    )
    .eq("is_featured", true)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .single();
}

// public: get latest pinned 3 posts
export async function getLatestPinnedPosts() {
  return supabase
    .from("posts")
    .select(
      `
      *,  
      author:profiles!inner(
        user_id,
        full_name,
        avatar_url
      ),
      category:categories(
        id,
        name,
        slug
      )
    `,
    )
    .eq("is_pinned", true)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3);
}
