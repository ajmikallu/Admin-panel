import { Outlet } from "react-router-dom";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Spinner } from "@/components/ui/spinner";
const AdminLayout = () => {
  const { profile, loading, role } = useProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <Header />
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

export default AdminLayout;
