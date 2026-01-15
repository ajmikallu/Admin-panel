export type PostStatus = "draft" | "published";

export interface Post {
  id: string;

  // Core content
  title: string;
  slug: string;
  excerpt: string | null;
  content: string; // HTML (TipTap output)

  // Media
  featured_image_url: string | null;
  featured_image_alt: string | null;

  // Relations
  author_id: string;
  category_id: string | null;

  // Publishing
  is_published: boolean;
  published_at: string | null;
  status?: PostStatus; // optional helper for UI logic

  // SEO
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;

  // Engagement
  view_count: number;
  like_count: number;
  comment_count: number;
  reading_time: number | null;

  // Flags
  is_featured: boolean;
  is_pinned: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface Comment {
  id: string;

  // Relations
  post_id: string;
  user_id: string;
  parent_id?: string | null; // for threaded comments

  // Content
  content: string;

  // Moderation
  status: CommentStatus;

  // Engagement
  like_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;

  // Relations
  post_id: string;
  user_id: string;

  // Timestamps
  created_at: string;
}

export interface CommentLike {
  id: string;

  // Relations
  comment_id: string;
  user_id: string;

  // Timestamps
  created_at: string;
}

export type PostView = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;

  /** Raw EditorJS JSON string */
  content: string;

  featured_image_url: string | null;
  featured_image_alt: string | null;

  author_id: string;
  category_id: string | null;

  is_published: boolean;
  published_at: string | null;

  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;

  view_count: number;
  like_count: number;
  comment_count: number;
  reading_time: number;

  is_featured: boolean;
  is_pinned: boolean;

  created_at: string;
  updated_at: string;

  /** Joined profile */
  author: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  };

  /** Joined category */
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

/**
 * Liked post with nested structure for dashboard display
 * Matches API response: { liked_at, post: { ... } }
 */
export interface LikedPostWithTimestamp {
  liked_at: string; // ISO date string when user liked the post
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    like_count: number;
    view_count: number;
    reading_time: number | null;
    author: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  };
}

export type LikedPostsWithTimestamp = LikedPostWithTimestamp[];
