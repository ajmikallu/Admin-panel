// src/features/profile/pages/ProfilePage.tsx
import { useState, useEffect } from "react";
import {
  // User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Palette,
  Edit2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  getProfile,
  updateProfile,
} from "@/features/profile/actions/profile.actions";
import { EditProfileModal } from "@/components/customer/EditProfileModal";
import type { UserProfile } from "@/types/models";
import type { UpdateProfileData } from "@/types/models";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      setUserEmail(user.email || "");
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (updates: UpdateProfileData) => {
    if (!profile) return;
    const updatedProfile = await updateProfile(profile.id, updates);
    setProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* <div className="mx-auto max-w-3xl px-4"> */}
      <div className="overflow-hidden bg-white shadow dark:bg-gray-800">
        {/* Header */}
        <div className="px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-600 text-3xl font-bold text-blue-400 dark:bg-white">
                {profile.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.full_name || "User"}
                </h1>
                <p>{profile.role}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <div>
                <div className="text-sm">Email</div>
                <div className="font-medium">{userEmail}</div>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5" />
                <div>
                  <div className="text-sm">Phone</div>
                  <div className="font-medium">{profile.phone}</div>
                </div>
              </div>
            )}

            {profile.age && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <div>
                  <div className="text-sm">Age</div>
                  <div className="font-medium">{profile.age} years</div>
                </div>
              </div>
            )}

            {profile.country && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <div>
                  <div className="text-sm">Country</div>
                  <div className="font-medium">{profile.country}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5" />
              <div>
                <div className="text-sm">Theme Preference</div>
                <div className="font-medium capitalize">{profile.theme}</div>
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="mt-6">
            <div className="text-sm">
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
      {/* </div> */}

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
