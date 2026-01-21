import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogMeta } from "@/components/blog/BlogMeta";
import { BlogDetailsSkeleton } from "@/components/skeleton/BlogDetailsSkeleton";
import { useBlogDetails } from "@/hooks/useBlogDetails";
import { useParams } from "react-router-dom";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogTags } from "@/components/blog/BlogTags";
import BlogComments from "@/components/blog/BlogComment";
import { BlogEngagement } from "@/components/blog/BlogEngagement";
import { BlogError } from "@/components/blog/BlogError";

export default function BlogDetailsPage() {
  const { slug } = useParams();

  const { post, loading, error } = useBlogDetails(slug);

  if (loading) return <BlogDetailsSkeleton />;
  if (error || !post) return <BlogError message={error || "Post not found"} />;

  return (
    <main className="bg-gray-50 py-12 dark:bg-gray-900">
      <article className="mx-auto max-w-4xl">
        {post && (
          <>
            <BlogHeader post={post} />
            <BlogMeta post={post} />
            <BlogContent content={post.content} postId={post.id} />
            <BlogTags keywords={post.meta_keywords ?? undefined} />
            <BlogEngagement post={post} />
            <BlogComments postId={post.id} />
          </>
        )}
      </article>
    </main>
  );
}
