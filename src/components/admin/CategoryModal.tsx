import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

import type { Category, UpdateCategoryData } from "@/types/models";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  categories: Category[];
  onSave: (updates: UpdateCategoryData) => Promise<void>;
}

export const CategoryModal = ({
  isOpen,
  onClose,
  category,
  categories,
  onSave,
}: CategoryModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(category);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UpdateCategoryData>({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      parent_id: null,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      reset({
        name: category.name ?? "",
        description: category.description ?? "",
        slug: category.slug ?? "",
        parent_id: category.parent_id ?? null,
      });
    } else {
      reset({
        name: "",
        description: "",
        slug: "",
        parent_id: null,
      });
    }

    setError(null);
  }, [isOpen, category, reset]);

  const onSubmit = async (data: UpdateCategoryData) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50">
      <div className="relative mx-5 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold">
          {isEditMode ? "Edit Category" : "Add Category"}
        </h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Name"
            name="name"
            type="text"
            register={register}
            error={errors.name}
            disabled={isLoading}
            placeholder="Category name"
          />

          <InputField
            label="Description"
            name="description"
            type="text"
            register={register}
            error={errors.description}
            disabled={isLoading}
            placeholder="Category description"
          />

          <InputField
            label="Slug"
            name="slug"
            type="text"
            register={register}
            error={errors.slug}
            disabled={isLoading}
            placeholder="category-slug"
          />

          <SelectField
            name="parent_id"
            label="Parent Category"
            placeholder="No parent"
            control={control}
            options={categories
              .filter((c) => c.id !== category?.id)
              .map((c) => ({
                label: c.name,
                value: c.id, // ✅ UUID only
              }))}
            error={errors.parent_id}
          />

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded border px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded bg-blue-600 px-4 py-2 text-white"
            >
              {isLoading
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
