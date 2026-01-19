TODO : profilr pic upload
TODO : Checkpoint (very important)
TODO:SEO for CSR
When to Implement Hybrid Approach:You should consider adding cached HTML later when:
Performance Issues - Your blog posts load slowly (100+ posts)
High Traffic - You're getting thousands of daily visitors
Complex Posts - Posts with 50+ blocks take time to render
SEO Optimization - You want instant server-side rendering
add related post in blogdetail page
add blog category list page
add author section under blog details page
add global loading

<!-- -- -->

Security concern: Dual role storage creates confusion risk.

Storing roles in two locations (auth.users.user_metadata.role and profiles.role) where only one is authoritative creates a risk of developers accidentally using the wrong source for authorization checks. This pattern has led to security vulnerabilities in other systems.

Additionally, line 64 describes auth.users.user_metadata.role as "deprecated" but lines 66-67 indicate it's still being written during signup. This contradiction is confusing—if deprecated, it should not be written at all.

Recommendations:

Remove role from auth.users.user_metadata entirely to eliminate the dual-storage pattern
If removal isn't feasible, add explicit warnings in code comments near any user_metadata access
Consider adding automated checks (linting rules or tests) to prevent accidental use of user_metadata.role for authorization

<!-- -- -->

CodeRabbit
Nested calls won't update the loading message.

When multiple concurrent withLoader calls occur, only the first call's message is displayed. Subsequent calls pass a message parameter that's silently ignored. Consider whether this is the intended behavior—if not, you may want to update the message on each call or maintain a message stack.

<!-- -- -->

Consider using React Query or SWR for data fetching and caching.

Per coding guidelines, data fetching should use React Query or SWR with a staleTime of 5 minutes for caching. The current implementation uses raw useState/useEffect which lacks automatic caching, request deduplication, and background refetching.

-import { useState, useEffect, useCallback } from "react";
+import { useState } from "react";
import { Link } from "react-router-dom";
+import { useInfiniteQuery } from "@tanstack/react-query";
Then replace the state and callbacks with:

const {
data,
isLoading,
isError,
error,
fetchNextPage,
hasNextPage,
isFetchingNextPage,
} = useInfiniteQuery({
queryKey: ['liked-posts'],
queryFn: ({ pageParam = 0 }) => getCustomerLikedPosts(loadMoreLimit, pageParam),
getNextPageParam: (lastPage, allPages) =>
lastPage.hasMore ? allPages.flatMap(p => p.data).length : undefined,
staleTime: 5 _ 60 _ 1000, // 5 minutes per guidelines
});

const posts = data?.pages.flatMap(page => page.data) ?? [];
const total = data?.pages[0]?.total ?? 0;
Also applies to: 28-33

<!-- -- -->

Add toast notification for error display.

Per coding guidelines, errors should be displayed via sonner.toast(). While the error banner with retry is good UX, add a toast notification for consistency with the rest of the application.

import { logger } from "@/lib/logger";
+import { toast } from "sonner";
} catch (err) {
const errorMessage =
err instanceof Error ? err.message : "Failed to fetch liked posts";
setError(errorMessage);
logger.error("Error fetching liked posts:", err);

-      toast.error(errorMessage);
       onError?.(errorMessage);
  } finally {

<!-- --------- -->

Consider memoizing post items for performance.

Per coding guidelines, heavy components should be memoized with React.memo(). With potentially 100+ posts, consider extracting the article into a memoized component to prevent unnecessary re-renders when loading more posts.

interface PostItemProps {
item: LikedPostsWithTimestamp[number];
}

const PostItem = React.memo(function PostItem({ item }: PostItemProps) {
const { post, liked_at } = item;
const authorInitials = /_ ... _/;

return (
<article key={post.id} /_ ... _/>
{/_ existing JSX _/}
</article>
);
});
Then in the render:

{posts.map((item) => (
<PostItem key={item.post.id} item={item} />
))}

<!-- ---- -->

CodeRabbit
Consider virtual scrolling for large lists.

Based on learnings, consider using a virtual scrolling library like react-window for blog lists with 100+ posts. With the current "Load More" pattern, users could accumulate many posts in the DOM. Virtual scrolling would render only visible items, improving performance for users who load many pages.

<!-- =-------------- -->

Hardcoded locale may affect internationalization.

The date formatting uses hardcoded "en-US" locale. Consider using the user's locale or a centralized date formatting utility if the application supports internationalization.

-                        {new Date(liked_at).toLocaleDateString("en-US", {

*                        {new Date(liked_at).toLocaleDateString(undefined, {
                           month: "short",
                           day: "numeric",
                           year: "numeric",
                         })}

<!-- ================== -->

Consider using a composite primary key for post_likes.

Based on learnings, this table should use (post_id, user_id) as a composite primary key rather than a surrogate UUID with a separate unique constraint. This simplifies the schema and aligns with the join table pattern.

CREATE TABLE post_likes (

- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
- UNIQUE(post_id, user_id)

* PRIMARY KEY (post_id, user_id)
  );

 <!-- ----------------- -->

Apply same composite primary key pattern to comment_likes.

For consistency with the recommended post_likes design, consider using a composite primary key here as well.

CREATE TABLE comment_likes (

- id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
- UNIQUE(comment_id, user_id)

* PRIMARY KEY (comment_id, user_id)
  );

 <!-- --------------- -->

Add guidance for production usage and log management.

The guide focuses on development debugging but doesn't address:

Production usage: Should this logger be used in production? If yes, how to control log levels?
Performance: What's the performance impact of extensive logging, especially with file location tracking?
Log sanitization: How to prevent accidentally logging sensitive data in production?
Environment configuration: Different logging strategies for development vs production
Consider adding a section on production best practices and environment-specific configuration.

Do you want me to help draft a production logging guidelines section?

<!-- ---------- -->

Capture IDs before async call to avoid stale closure.

The non-null assertions post!.id and user!.id inside the async checkLike function rely on closure values that could theoretically change if React re-renders between the guard check and the async execution. Capturing the IDs upfront is safer.

useEffect(() => {
if (!user?.id || !post) {
setIsLiked(false);
return;
}

- const postId = post.id;
- const userId = user.id;

  async function checkLike() {
  try {
  setIsCheckingLike(true);

*        const { data, error } = await hasLikedPost(post!.id, user!.id);

-        const { data, error } = await hasLikedPost(postId, userId);
         if (error) {
           console.error("Error checking like status:", error);
           setIsLiked(false);
           return;
         }
         setIsLiked(!!data);
       } catch (err) {
         console.error("Failed to check like status:", err);
         setIsLiked(false);
       } finally {
         setIsCheckingLike(false);
       }

  }

  checkLike();
  }, [user?.id, post?.id]);

   <!-- -- -->

  Consider true optimistic updates for better UX.

The current implementation waits for the API response before updating the UI state (lines 136-138 and 143-145). For a truly optimistic experience, update the UI immediately, then revert on error.

     try {
       setLikeLoading(true);

-      // Optimistic update
-      setIsLiked(!isLiked);
-      setPost({
-        ...post,
-        like_count: isLiked
-          ? Math.max(0, previousLikeCount - 1)
-          : previousLikeCount + 1,
-      });

       if (isLiked) {
         // Unlike
         const { error } = await unlikePost(post.id);
         if (error) throw error;

*        setIsLiked(false);
*        setPost({ ...post, like_count: Math.max(0, previousLikeCount - 1) });
         toast.success("Post unliked");
       } else {
         // Like
         const { error } = await likePost(post.id);
         if (error) throw error;
*        setIsLiked(true);
*        setPost({ ...post, like_count: previousLikeCount + 1 });
         toast.success("Post liked!");
       }
     } catch (err) {
<!-- ------------ -->

Broad skip pattern may cause false negatives. logger.tsx

The pattern "at Object." is quite generic and may skip legitimate caller frames, particularly for code at module scope. This could result in "unknown" being returned more often than necessary.

Consider being more specific, e.g., "at Object.<anonymous>" if targeting specific bundler patterns.

<!-- ------- -->

Consider adding a comment explaining the sort. like.api.tsx

The client-side sort is necessary because .in("id", postIds) doesn't preserve the order of postIds. A brief comment would help future maintainers understand this isn't redundant.

     .filter((item): item is NonNullable<typeof item> => item !== null)

- // Re-sort needed: .in() query doesn't preserve postIds order from likes query
  .sort(
  (a, b) => new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime(),
  );


    <!-- --------------- -->
