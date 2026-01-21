import { hasLikedPost, togglePostLike } from "@/features/blog/api/likes.api";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import { logger } from "@/lib/logger";

export function useBlogLike(postId?: string, initialCount = 0) {
  const { user } = useAuth();
  const { permissions } = useProfile();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialCount);

  useEffect(() => {
    if (!user?.id || !postId) return;
    hasLikedPost(postId, user.id).then(setIsLiked);
  }, [postId, user?.id]);

  const toggle = async () => {
    if (!user || !permissions.canLike || !postId) return;

    const prev = isLiked;
    setIsLiked(!prev);
    setLikeCount((c) => (prev ? c - 1 : c + 1));

    try {
      const result = await togglePostLike(postId, prev);
      if (result.error) throw result.error;
      setIsLiked(result.isLiked);
      setLikeCount((c) => (result.isLiked ? c + 1 : c - 1));
    } catch (error) {
      logger.error({ error, postId }, "Failed to toggle like");
      setIsLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
  };

  return { isLiked, likeCount, toggle };
}
