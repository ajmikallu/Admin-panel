// src/pages/admin/blog/BlogList.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllPostsAdmin, deletePost } from "@/features/blog/api";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit2, Trash2, Eye, Calendar } from "lucide-react";
import type { Post } from "@/types/blog.types";
import { toast } from "sonner";

const BlogList = () => {
  const [blogs, setBlogs] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { role } = useProfile();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllPostsAdmin();
      if (error) {
        console.error("Error fetching blogs:", error);
        toast.error("Failed to load blogs. Please try again.");
      } else {
        setBlogs(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching blogs:", error);
      toast.error("An unexpected error occurred while loading blogs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId: string, blogTitle: string) => {
    const confirmMsg = `Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(blogId);
    try {
      const { error } = await deletePost(blogId);
      if (error) {
        console.error("Error deleting blog:", error);
        toast.error("Failed to delete blog. Please try again.");
      } else {
        // Remove the deleted blog from the list
        setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      }
    } catch (error) {
      console.error("Unexpected error deleting blog:", error);
      toast.error("An unexpected error occurred while deleting the blog.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (post: Post) => {
    const isPublished = post.is_published;
    const status = post.status || (isPublished ? "published" : "draft");

    if (status === "published") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        Draft
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-gray-100">
              Blog Posts
            </h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
              Manage and view all your blog posts
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/admin/blogs/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">New Blog Post</span>
              <span className="sm:hidden">New Post</span>
            </Link>
          </Button>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="space-y-3 lg:hidden">
          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-12 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No blog posts yet
              </h3>
              <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Get started by creating your first blog post.
              </p>
              <Button asChild>
                <Link to="/admin/blogs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Link>
              </Button>
            </div>
          ) : (
            blogs.map((blog) => (
              <div
                key={blog.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="p-4">
                  {/* Title and Status Row */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">{getStatusBadge(blog)}</div>
                  </div>

                  {/* Meta Info Row */}
                  <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      <span>
                        {new Date(blog.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      <span>{blog.view_count || 0} views</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 sm:flex-initial"
                    >
                      <Link to={`/admin/blogs/${blog.id}/edit`}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    {(role === "admin" || role === "superAdmin") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 sm:flex-initial"
                        onClick={() => handleDelete(blog.id, blog.title)}
                        disabled={deletingId === blog.id}
                      >
                        {deletingId === blog.id ? (
                          <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block dark:border-gray-700 dark:bg-gray-900">
          {blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <Eye className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No blog posts yet
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Get started by creating your first blog post.
              </p>
              <Button asChild>
                <Link to="/admin/blogs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Views
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {blog.title}
                          </span>
                          {blog.excerpt && (
                            <span className="mt-1 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                              {blog.excerpt}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(blog)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(blog.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Eye className="mr-1.5 h-4 w-4" />
                          {blog.view_count || 0}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8"
                          >
                            <Link to={`/admin/blogs/${blog.id}/edit`}>
                              <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                          {(role === "admin" || role === "superAdmin") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8"
                              onClick={() => handleDelete(blog.id, blog.title)}
                              disabled={deletingId === blog.id}
                            >
                              {deletingId === blog.id ? (
                                <>
                                  <Spinner className="mr-1.5 h-3.5 w-3.5" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                  Delete
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {blogs.length > 0 && (
          <div className="mt-3 text-xs text-gray-600 sm:mt-4 sm:text-sm dark:text-gray-400">
            Showing {blogs.length} blog post{blogs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
