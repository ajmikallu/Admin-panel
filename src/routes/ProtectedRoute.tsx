// src/routes/ProtectedRoute.tsx - SIMPLIFIED
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Optional role check
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth(); // 👈 user + loading ONLY
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ProtectedRoute.tsx - Simple redirect
  if (
    allowedRoles?.length &&
    profile?.role &&
    !allowedRoles.includes(profile.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Role check needs profile → defer to layout level
  return <Outlet />;
};

export default ProtectedRoute;
