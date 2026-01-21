// src/pages/admin/blog/NewBlog.tsx
import { useState, useEffect, useRef } from "react";
import { createPost } from "@/features/blog/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCategories } from "@/features/category/Category.api";
import { EditorComponent } from "@/components/admin/editor/EditorComponent";
import type { OutputData } from "@editorjs/editorjs";
import { uploadPostImage } from "@/features/blog/api/posts.api";

export default function NewBlog() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Blog form state
  const [title, setTitle] = useState("");
  const [editorData, setEditorData] = useState<OutputData | undefined>();
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const { data, error } = await getCategories();
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  // Calculate reading time based on content
  function calculateReadingTime(data: OutputData): number {
    if (!data.blocks) return 0;

    let wordCount = 0;
    data.blocks.forEach((block) => {
      if (block.type === "paragraph" || block.type === "header") {
        const text = block.data.text || "";
        wordCount += text.split(/\s+/).filter(Boolean).length;
      }
    });

    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200) || 1;
  }

  // Handle file selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }

    setFeaturedImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFeaturedImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Upload image to Supabase Storage
  async function uploadFeaturedImage(): Promise<string | null> {
    if (!featuredImageFile || !user) return null;

    setIsUploading(true);

    try {
      const url = await uploadPostImage(featuredImageFile, user.id);
      setUploadProgress(100);
      return url;
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  // Remove selected image
  function removeImage() {
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setFeaturedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Shared function for both draft and publish
  async function savePost(isPublished: boolean) {
    // Validation
    if (!user) {
      alert("You must be logged in to create a blog");
      return;
    }

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
      alert("Content is required");
      return;
    }

    setIsLoading(true);

    try {
      // Upload featured image if selected
      let uploadedImageUrl = featuredImageUrl;
      if (featuredImageFile && !featuredImageUrl) {
        uploadedImageUrl = await uploadFeaturedImage();
        if (!uploadedImageUrl) {
          alert("Failed to upload image. Please try again.");
          setIsLoading(false);
          return;
        }
        setFeaturedImageUrl(uploadedImageUrl);
      }

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Convert Editor.js data to JSON string for storage
      const contentJSON = JSON.stringify(editorData);
      const readingTime = calculateReadingTime(editorData);

      // Create post with all data
      const { data, error } = await createPost({
        title,
        slug,
        excerpt: excerpt || null,
        content: contentJSON,
        author_id: user.id,
        category_id: categoryId || null,
        is_published: isPublished,
        published_at: isPublished ? new Date().toISOString() : null,
        reading_time: readingTime,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords
          ? metaKeywords.split(",").map((k) => k.trim())
          : null,
        featured_image_url: uploadedImageUrl,
        featured_image_alt: featuredImageAlt || null,
        is_featured: isFeatured,
        is_pinned: isPinned,
      });

      if (error) {
        console.error(error);
        alert(`Failed to ${isPublished ? "publish" : "save"} post`);
        return;
      }

      // Success feedback
      alert(
        isPublished
          ? "Post published successfully!"
          : "Draft saved successfully!",
      );

      // Navigate based on publish status
      if (isPublished) {
        navigate(`/blogs/${data.slug}`);
      } else {
        navigate(`/admin/blogs/${data.id}/edit`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while saving the post");
    } finally {
      setIsLoading(false);
    }
  }

  // Wrapper functions for button handlers
  async function handleSaveDraft() {
    await savePost(false);
  }

  async function handlePublish() {
    await savePost(true);
  }
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Blog Post
        </h1>
        <p className="mt-2 text-gray-600">
          Write and publish your blog post with rich content formatting
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            placeholder="Enter your blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={categoryId || ""}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="">Select a category (optional)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <EditorComponent
            data={editorData}
            onChange={setEditorData}
            placeholder=" Start writing your amazing blog post..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Excerpt (Optional)
          </label>
          <textarea
            placeholder="Brief summary of your post (shown in post listings)"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            A short description that appears in blog listings and previews
          </p>
        </div>
        {/* Featured Image Upload */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Featured Image
          </h3>

          {!featuredImagePreview ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                id="featured-image-upload"
              />
              <label
                htmlFor="featured-image-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 transition-colors hover:border-blue-500 hover:bg-blue-50"
              >
                <svg
                  className="mb-3 h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  Click to upload featured image
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP or GIF (max 5MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Image Preview */}
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={featuredImagePreview}
                  alt="Featured image preview"
                  className="h-64 w-full object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-700"
                  type="button"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-700">Uploading...</span>
                    <span className="font-medium text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Image Info */}
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">File:</span>{" "}
                  {featuredImageFile?.name}
                </p>
                <p>
                  <span className="font-medium">Size:</span>{" "}
                  {featuredImageFile
                    ? (featuredImageFile.size / 1024).toFixed(2)
                    : 0}{" "}
                  KB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Featured Image Alt Text */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Featured Image Alt Text {featuredImagePreview && "*"}
          </label>
          <input
            placeholder="Describe the featured image for accessibility"
            value={featuredImageAlt}
            onChange={(e) => setFeaturedImageAlt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {featuredImagePreview
              ? "Alt text is required when you have a featured image"
              : "Alt text improves accessibility and SEO"}
          </p>
        </div>

        {/* SEO Section */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            SEO Settings (Optional)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                placeholder="SEO title (max 60 characters)"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {metaTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                placeholder="SEO description (max 160 characters)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={160}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meta Keywords
              </label>
              <input
                placeholder="keyword1, keyword2, keyword3"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate keywords with commas
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Display Options
          </h3>

          <div className="space-y-3">
            {/* Featured Checkbox */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Mark as Featured
                </span>
                <p className="text-xs text-gray-600">
                  Featured posts appear prominently on the homepage and get more
                  visibility
                </p>
              </div>
            </label>

            {/* Pinned Checkbox */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  Pin to Top
                </span>
                <p className="text-xs text-gray-600">
                  Pinned posts stay at the top of the blog list regardless of
                  publish date
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t pt-6">
          <button
            disabled={!title || !editorData || isLoading}
            onClick={handleSaveDraft}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            disabled={!title || !editorData || isLoading}
            onClick={handlePublish}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Publishing..." : "Publish Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
