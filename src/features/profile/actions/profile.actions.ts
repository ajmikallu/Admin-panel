// src/features/profile/profile.actions.ts
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/models";
import type { User } from "@supabase/supabase-js";
import type { UpdateProfileData } from "@/types/models";

// 👇 CREATE - Auto-creates on signup (already handled)
export const createProfile = async (
  user: User,
  data: Partial<UpdateProfileData>,
) => {
  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    ...data,
    role: "customer", // Default
    theme: data.theme || "light",
  });

  if (error) throw error;
};

// 👇 READ - Get current user's profile
export const getProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// 👇 UPDATE - Edit profile fields
export const updateProfile = async (
  profileId: string,
  updates: UpdateProfileData,
): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 👇 DELETE - (Rarely used, but complete)
export const deleteProfile = async (profileId: string) => {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);
  if (error) throw error;
};
