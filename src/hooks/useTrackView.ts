// hooks/useTrackView.ts
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * Get or create a session ID for anonymous tracking
 */
function getSessionId(): string {
  const SESSION_KEY = "blog_session_id";
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Get client IP address (best effort)
 * Note: This may not work in all environments
 */
// async function getClientIP(): Promise<string | null> {
//   try {
//     const response = await fetch("https://api.ipify.org?format=json");
//     const data = await response.json();
//     return data.ip;
//   } catch (error) {
//     console.warn("Failed to get IP address:", error);
//     return null;
//   }
// }

interface TrackViewOptions {
  postId: string;
  userId?: string | null;
  delay?: number; // Delay before tracking (in ms)
}

/**
 * Hook to track post views with deduplication
 *
 * @param postId - The post ID to track
 * @param userId - Optional user ID (if logged in)
 * @param delay - Delay before tracking in milliseconds (default: 3000ms)
 *
 * @example
 * ```tsx
 * const { isTracking, isNewView } = useTrackView({
 *   postId: post.id,
 *   userId: user?.id,
 *   delay: 3000
 * });
 * ```
 */
export function useTrackView({
  postId,
  userId,
  delay = 3000,
}: TrackViewOptions) {
  const hasTracked = useRef(false);
  const isTrackingRef = useRef(false);

  useEffect(() => {
    // Don't track if already tracked or no postId
    if (hasTracked.current || !postId) return;

    const trackView = async () => {
      // Prevent duplicate tracking calls
      if (isTrackingRef.current) return;
      isTrackingRef.current = true;

      try {
        // Gather tracking data
        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent || null;

        // Optional: Get IP (may add latency)
        // const ipAddress = await getClientIP();

        // Call RPC function
        const { data, error } = await supabase.rpc("track_post_view", {
          p_post_id: postId,
          p_user_id: userId || null,
          p_session_id: sessionId,
          p_referrer: referrer,
          p_ip_address: null, // Set to ipAddress if you want IP tracking
          p_user_agent: userAgent,
        });

        if (error) {
          console.error("Failed to track view:", error);
          return;
        }

        // Log result (optional, remove in production)
        if (data?.is_new_view) {
          console.log("✅ New view tracked");
        } else {
          console.log("ℹ️ Duplicate view (not counted)");
        }

        // Mark as tracked
        hasTracked.current = true;
      } catch (error) {
        console.error("Error tracking view:", error);
      } finally {
        isTrackingRef.current = false;
      }
    };

    // Track after delay (avoids counting accidental clicks/bounces)
    const timer = setTimeout(trackView, delay);

    return () => clearTimeout(timer);
  }, [postId, userId, delay]);

  return {
    isTracking: isTrackingRef.current,
    hasTracked: hasTracked.current,
  };
}

// ============================================================================
// Alternative: Direct API function (if not using hook)
// ============================================================================

export async function trackPostView(
  postId: string,
  userId?: string | null,
): Promise<{ success: boolean; isNewView: boolean }> {
  try {
    const sessionId = getSessionId();
    const referrer = document.referrer || null;
    const userAgent = navigator.userAgent || null;

    const { data, error } = await supabase.rpc("track_post_view", {
      p_post_id: postId,
      p_user_id: userId || null,
      p_session_id: sessionId,
      p_referrer: referrer,
      p_ip_address: null,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error("Failed to track view:", error);
      return { success: false, isNewView: false };
    }

    return {
      success: data?.success || false,
      isNewView: data?.is_new_view || false,
    };
  } catch (error) {
    console.error("Error tracking view:", error);
    return { success: false, isNewView: false };
  }
}
