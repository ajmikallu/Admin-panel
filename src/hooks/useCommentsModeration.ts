import { useEffect, useState, useCallback, useRef } from "react";
import {
  getAllCommentsAdmin,
  moderateComment,
} from "@/features/blog/api/comments.api";
import type {
  CommentType,
  FilterType,
  CommentStatus,
  CommentAPIResponse,
} from "@/types/comment.types";

// Helper function to map API response to CommentType
const mapCommentData = (data: CommentAPIResponse[]): CommentType[] => {
  return (data || []).map((c) => ({
    id: c.id,
    content: c.content,
    status: c.status,
    created_at: c.created_at,
    parent_id: c.parent_id,
    like_count: c.like_count,
    posts: c.posts || { id: "", title: "" },
    profile: c.profile || {},
  }));
};

export function useCommentsModeration(
  profileLoading: boolean,
  hasAdminAccess: boolean,
) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("pending");
  const hasInitialLoadRef = useRef(false);
  const loadingRef = useRef(false);
  const filterLoadingRef = useRef(false);

  // Consolidated data fetching function
  const fetchComments = useCallback(
    async (statusFilter: FilterType, isInitialLoad: boolean) => {
      // Set appropriate loading state
      if (isInitialLoad) {
        setLoading(true);
        loadingRef.current = true;
      } else {
        setFilterLoading(true);
        filterLoadingRef.current = true;
      }

      try {
        const statusParam = statusFilter === "all" ? undefined : statusFilter;
        const { data, error } = await getAllCommentsAdmin(statusParam);

        if (error) {
          console.error("Failed to load comments:", error);
          alert("Failed to load comments. Please try again.");
          setComments([]);
          return;
        }

        const mapped = mapCommentData(data || []);
        setComments(mapped);
      } catch (err) {
        console.error("Unexpected error loading comments:", err);
        alert("An unexpected error occurred while loading comments.");
        setComments([]);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
          loadingRef.current = false;
        } else {
          setFilterLoading(false);
          filterLoadingRef.current = false;
        }
      }
    },
    [],
  );

  // Initial load effect - runs once when component mounts and profile is ready
  useEffect(() => {
    if (!profileLoading && hasAdminAccess) {
      if (!hasInitialLoadRef.current) {
        hasInitialLoadRef.current = true;
        fetchComments(filter, true);
      } else if (!loadingRef.current && !filterLoadingRef.current) {
        fetchComments(filter, false);
      }
    }
  }, [profileLoading, hasAdminAccess, filter, fetchComments]);

  // Memoized moderation handler
  // In useCommentsModeration.ts - UPDATE handleModerate:
  const handleModerate = useCallback(
    async (commentId: string, status: CommentStatus) => {
      const confirmMsg = `Are you sure you want to mark this comment as ${status}?`;
      if (!window.confirm(confirmMsg)) return;

      setModeratingId(commentId);
      try {
        const { error } = await moderateComment(commentId, status);
        if (error) {
          console.error("Error moderating comment:", error);
          alert("Failed to update comment status. Please try again.");
          return;
        }

        // 🎯 CRITICAL: REFETCH after success to sync with server
        const statusParam = filter === "all" ? undefined : filter;
        const { data, error: fetchError } =
          await getAllCommentsAdmin(statusParam);
        if (!fetchError && data) {
          setComments(mapCommentData(data));
        }
      } finally {
        setModeratingId(null);
      }
    },
    [filter], // ✅ Add filter dependency
  );

  return {
    comments,
    loading,
    filterLoading,
    filter,
    setFilter,
    handleModerate,
    moderatingId,
  };
}
