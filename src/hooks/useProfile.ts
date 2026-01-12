import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import type { AppRole, UserProfile } from "@/types/models";
// hooks/useProfile.ts - Auto-magical
export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data || null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 👈 AUTO-FETCH when user changes!
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ----------------------------------
   * Derived authorization helpers
   * ---------------------------------- */

  const role: AppRole = profile?.role ?? "customer";

  const permissions = useMemo(() => {
    return {
      role,
      isCustomer: role === "customer",
      isEmployee: role === "employee",
      isAdmin: role === "admin",
      isSuperAdmin: role === "superAdmin",

      // Blog permissions
      canCreateBlog: ["employee", "admin", "superAdmin"].includes(role),
      canEditBlog: ["employee", "admin", "superAdmin"].includes(role),
      canDeleteBlog: ["admin", "superAdmin"].includes(role),
      canComment: role === "customer",
      canLike: role === "customer",
    };
  }, [role]);

  return { profile, loading, role, permissions, refetch: fetchProfile }; // Still expose for manual refresh
};
