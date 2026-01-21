// src/pages/admin/blog/BlogList.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllPostsAdmin, deletePost } from "@/features/blog/api";
import { useProfile } from "@/hooks/useProfile";

const BlogList = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useProfile();
  useEffect(() => {
    getAllPostsAdmin().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching blogs:", error);
      } else {
        setBlogs(data || []);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1>Blogs</h1>
        <Link to="/admin/blogs/new">+ New Blog</Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {blogs.map((blog) => (
            <tr key={blog.id}>
              <td>{blog.title}</td>
              <td>{blog.status}</td>
              <td>{new Date(blog.created_at).toLocaleDateString()}</td>
              <td>
                <Link to={`/customer/blogs/${blog.id}/edit`}>Edit</Link>

                {(role === "admin" || role === "superAdmin") && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => deletePost(blog.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogList;
