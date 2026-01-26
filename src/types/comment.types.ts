export type CommentType = {
  id: string;
  content: string;
  status: string;
  created_at: string;
  parent_id?: string | null;
  like_count: number;
  posts: { id: string; title: string } | null;
  profile?: { full_name?: string; email?: string; role?: string } | null;
};

export type FilterType = "pending" | "approved" | "rejected" | "spam" | "all";

export type CommentStatus = "approved" | "rejected" | "spam";

export type CommentAPIResponse = {
  id: string;
  content: string;
  status: CommentStatus;
  created_at: string;
  parent_id: string | null;
  like_count: number;
  posts?: { id: string; title: string };
  profile?: Record<string, any>;
};
