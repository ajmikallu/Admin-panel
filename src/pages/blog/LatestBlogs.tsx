import { useEffect, useState } from "react";
import { getPublishedPosts } from "@/features/blog/api";
import type { PostView } from "@/types/blog.types";
import { Link } from "react-router-dom";
const LatestBlogs = () => {
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error, count } = await getPublishedPosts(page, pageSize);

      if (error) {
        setError(error.message);
      } else {
        setPosts(data ?? []);
        if (count) {
          setTotalPages(Math.ceil(count / pageSize));
        }
      }

      setLoading(false);
    }

    load();
  }, [page]);
  if (loading) return <p>Loading blogs…</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <main>
      <div className="container mx-auto max-w-5xl gap-10 pt-5 text-gray-800 dark:text-gray-200">
        <div className="posts px-3 pb-10">
          <h1 className="text-center text-2xl font-extrabold md:text-start">
            Latest Posts
          </h1>
          <div className="mt-8 grid grid-cols-12 md:gap-10">
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="col-span-12 md:col-span-4">
                <Link to={`/blogs/${post.slug}`}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md">
                    <img
                      src={
                        post.featured_image_url ||
                        "https://www.hostinger.com/blog/wp-content/uploads/sites/4/2026/01/horizons-llms-1024x576.webp"
                      }
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </Link>

                <div className="mt-4 flex flex-1 flex-col">
                  <p className="pb-3 text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toDateString()
                      : ""}
                  </p>

                  <h5 className="pb-4 text-xl leading-snug font-semibold">
                    <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
                  </h5>

                  <p className="text-sm">{post.excerpt}</p>

                  {/* Spacer pushes bottom content down */}
                  <div className="mt-auto" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`rounded px-4 py-2 ${
                  page === i + 1
                    ? "bg-black text-white"
                    : "border hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LatestBlogs;
