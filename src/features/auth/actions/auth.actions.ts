import { supabase } from "@/lib/supabase/client";
import type { AppRole } from "@/types/models";

export async function signInAction(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signUpAction(params: {
  email: string;
  password: string;
  full_name: string;
  country?: string;
  role?: AppRole;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.full_name,
        country: params.country || "AE", // Default to UAE
        role: params.role || "admin",
      },
    },
  });

  if (error) throw error;
  return data.user;
}

export async function signOutAction() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
