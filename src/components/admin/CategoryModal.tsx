import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";

import type { Category, UpdateCategoryData } from "@/types/models";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEditMode ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
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
              placeholder="Enter category name"
            />

            <InputField
              label="Description"
              name="description"
              type="text"
              register={register}
              error={errors.description}
              disabled={isLoading}
              placeholder="Enter category description (optional)"
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
              placeholder="No parent (top level)"
              control={control}
              options={categories
                .filter((c) => c.id !== category?.id)
                .map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
              error={errors.parent_id}
            />

            {/* Footer Actions */}
            <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
