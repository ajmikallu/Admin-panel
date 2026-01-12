import { useEffect, useState } from "react";
import { CategoryModal } from "@/components/admin/CategoryModal";
import {
  createCategory,
  getCategories,
  updateCategory,
} from "@/features/category/Category.api";
import type { Category, UpdateCategoryData } from "@/types/models";

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
    const { data, error } = await getCategories();

    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data ?? []);
    }

    setLoading(false);
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
    if (selectedCategory) {
      await updateCategory(selectedCategory.id, data);
    } else {
      await createCategory(data);
    }

    await fetchCategories();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={openAddModal}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + New Category
        </button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-md border bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{category.name}</h2>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              <button
                onClick={() => openEditModal(category)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

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
