import { getPostBySlug } from "@/features/blog/api/posts.api";
import { useState } from "react";
import type { PostView } from "@/types/blog.types";
import { useEffect } from "react";

export function useBlogDetails(slug?: string) {
  const [post, setPost] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        setLoading(true);
        const { data, error } = await getPostBySlug(slug as string);
        if (error) throw error;
        setPost(data);
      } catch (err) {
        setError("Post not found");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  return { post, loading, error };
}
