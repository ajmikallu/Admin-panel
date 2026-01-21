export function BlogTags({ keywords = [] }: { keywords?: string[] }) {
  if (!keywords.length) return null;

  return (
    <div className="mt-12 px-4">
      <h3 className="mb-3 text-sm font-semibold uppercase">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-100 dark:bg-gray-100 dark:text-gray-800"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
