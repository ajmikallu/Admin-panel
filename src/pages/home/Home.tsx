import { featuredPosts, categories } from "@/data/blogData";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* HERO */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Web Development, Without the Fluff
        </h1>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
          Practical tutorials, real-world examples, and production-level code
          for modern web developers.
        </p>
        <button className="rounded bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
          Read Latest Articles
        </button>
      </section>

      {/* FEATURED POSTS */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold">Featured Articles</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border bg-gray-50 p-5 transition hover:shadow-md dark:bg-gray-800"
            >
              <h3 className="mb-2 text-lg font-semibold">{post.title}</h3>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">⏱ {post.readTime}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-gray-100 px-6 py-12 dark:bg-gray-800">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold">Browse by Technology</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <span
                key={cat}
                className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-medium transition hover:bg-blue-600 hover:text-white dark:bg-gray-700"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS BLOG */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-6 text-center text-2xl font-bold">Why This Blog?</h2>
        <div className="grid gap-6 text-center md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold">Production Focused</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No toy examples. Only real-world patterns and best practices.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Clean Code</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Emphasis on architecture, readability, and maintainability.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Developer First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Written by a working developer, not a content farm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
