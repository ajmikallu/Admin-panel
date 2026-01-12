// src/features/profile/components/EditProfileModal.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { UserProfile, UpdateProfileData } from "@/types/models";
import InputField from "@/components/form/InputField";
import { useForm } from "react-hook-form";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updates: UpdateProfileData) => Promise<void>;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileData>({
    defaultValues: {
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      age: profile.age || undefined,
      country: profile.country || "",
    },
  });

  // Reset form with current profile data when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        age: profile.age || undefined,
        country: profile.country || "",
      });
      setError(null);
    }
  }, [isOpen, profile, reset]);

  const onSubmit = async (data: UpdateProfileData) => {
    setIsLoading(true);
    setError(null);

    try {
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
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
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">Edit Profile</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Full Name"
            name="full_name"
            type="text"
            register={register}
            error={errors.full_name}
            disabled={isLoading}
            placeholder="John Doe"
          />

          <InputField
            label="Country"
            name="country"
            type="text"
            register={register}
            error={errors.country}
            disabled={isLoading}
            placeholder="United States"
          />

          <InputField
            label="Phone"
            name="phone"
            type="tel"
            register={register}
            error={errors.phone}
            disabled={isLoading}
            placeholder="+1234567890"
          />

          <InputField
            label="Age"
            name="age"
            type="number"
            register={register}
            error={errors.age}
            disabled={isLoading}
            placeholder="30"
            validation={{
              min: { value: 1, message: "Age must be at least 1" },
              max: { value: 120, message: "Age must be less than 120" },
            }}
          />

          {/* <div>
            <label
              htmlFor="theme"
              className="block text-sm font-medium text-gray-700"
            >
              Theme
            </label>
            <select
              id="theme"
              {...register("theme")}
              disabled={isLoading}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div> */}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
