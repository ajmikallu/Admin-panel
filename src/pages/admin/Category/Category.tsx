// src/pages/admin/category/CategoryPage.tsx
import { useEffect, useState } from "react";
import { CategoryModal } from "@/components/admin/CategoryModal";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/features/category/Category.api";
import type { Category, UpdateCategoryData } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit2, FolderOpen } from "lucide-react";
import { toast } from "sonner";

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await getCategories();

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories. Please try again.");
      } else {
        setCategories(data ?? []);
      }
    } catch (error) {
      console.error("Unexpected error fetching categories:", error);
      toast.error("An unexpected error occurred while loading categories.");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSave = async (data: UpdateCategoryData) => {
    try {
      if (selectedCategory) {
        const { error } = await updateCategory(selectedCategory.id, data);
        if (error) {
          toast.error("Failed to update category. Please try again.");
          return;
        }
        toast.success("Category updated successfully!");
      } else {
        const { error } = await createCategory(data);
        if (error) {
          toast.error("Failed to create category. Please try again.");
          return;
        }
        toast.success("Category created successfully!");
      }

      await fetchCategories();
      closeModal();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading categories...
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
              Categories
            </h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
              Manage and organize your blog categories
            </p>
          </div>
          <Button onClick={openAddModal} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Category</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="space-y-3 lg:hidden">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-12 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No categories yet
              </h3>
              <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Get started by creating your first category.
              </p>
              <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Category
              </Button>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="p-4">
                  {/* Title */}
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Info */}
                  {category.slug && (
                    <div className="mb-4 text-xs text-gray-500 dark:text-gray-500">
                      Slug: <span className="font-mono">{category.slug}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(category)}
                      className="flex-1"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block dark:border-gray-700 dark:bg-gray-900">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No categories yet
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Get started by creating your first category.
              </p>
              <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-gray-500 dark:text-gray-500">
                          {category.slug || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(category)}
                            className="h-8"
                          >
                            <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
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
        {categories.length > 0 && (
          <div className="mt-3 text-xs text-gray-600 sm:mt-4 sm:text-sm dark:text-gray-400">
            Showing {categories.length} categor
            {categories.length !== 1 ? "ies" : "y"}
          </div>
        )}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        category={selectedCategory}
        categories={categories}
        onSave={handleSave}
      />
    </div>
  );
};

export default CategoryPage;