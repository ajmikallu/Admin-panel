// src/features/profile/pages/ProfilePage.tsx
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Calendar, Palette, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
  getProfile,
  updateProfile,
} from "@/features/profile/actions/profile.actions";
import { EditProfileModal } from "@/components/customer/EditProfileModal";
import type { UserProfile } from "@/types/models";
import type { UpdateProfileData } from "@/types/models";
import { Separator } from "@/components/ui/separator";
import { useLoader } from "@/hooks/useLoader";
import { ProfilePageSkeleton } from "@/components/skeleton";

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { withLoader } = useLoader();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await withLoader(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Not authenticated");

        setUserEmail(user.email || "");
        const profileData = await getProfile(user.id);
        setProfile(profileData);
      }, "Loading profile...");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (updates: UpdateProfileData) => {
    if (!profile) return;

    const previousProfile = profile;

    try {
      await withLoader(async () => {
        const updatedProfile = await updateProfile(profile.id, updates);
        setProfile(updatedProfile);
      }, "Updating profile...");

      toast.success("Profile updated successfully");
    } catch (err) {
      // Revert optimistic UI changes
      setProfile(previousProfile);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error("Failed to update profile", {
        description: errorMessage,
      });
    }
  };

  // Loading state - Show skeleton
  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-900">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-10 w-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            Failed to Load Profile
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={loadProfile}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile not found
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg dark:bg-gray-900">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            Profile Not Found
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            We couldn't find your profile information.
          </p>
          <button
            onClick={loadProfile}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="overflow-hidden bg-white shadow dark:bg-gray-900">
        {/* Header */}
        <div className="px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white dark:bg-blue-500">
                {profile.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.full_name || "User"}
                </h1>
                <p className="text-gray-600 capitalize dark:text-gray-400">
                  {profile.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </div>
                <div className="font-medium">{userEmail}</div>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Phone
                  </div>
                  <div className="font-medium">{profile.phone}</div>
                </div>
              </div>
            )}

            {profile.age && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Age
                  </div>
                  <div className="font-medium">{profile.age} years</div>
                </div>
              </div>
            )}

            {profile.country && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Country
                  </div>
                  <div className="font-medium">{profile.country}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Palette className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Theme Preference
                </div>
                <div className="font-medium capitalize">{profile.theme}</div>
              </div>
            </div>
          </div>

          <Separator className="my-4 dark:bg-gray-700" />

          <div className="mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Member since{" "}
              {new Date(profile.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
