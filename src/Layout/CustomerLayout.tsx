import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import CustomerHeader from "@/components/CustomerHeader";
import Sidebar from "@/components/Sidebar";
import { Spinner } from "@/components/ui/spinner";

export const CustomerLayout = () => {
  const { profile, loading, role } = useProfile();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  if (["admin", "superAdmin"].includes(profile.role)) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  if (!["customer", "employee"].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Header */}
      <CustomerHeader onMenuClick={() => setMobileOpen(true)} />

      {/* Body */}
      <div className="relative flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r bg-gray-100 transition-transform duration-300 md:static md:translate-x-0 dark:bg-gray-900 ${collapsed ? "md:w-16" : "md:w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} w-64`}
        >
          <Sidebar
            role={role}
            collapsed={collapsed}
            onToggle={() => setCollapsed((p) => !p)}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </aside>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Content */}
        <main className="relative flex-1 overflow-y-auto bg-gray-50 p-4 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
