import { NavLink } from "react-router-dom";
import { SIDEBAR_ITEMS } from "@/sidebar.config";
import type { AppRole } from "@/types/models";
import { ROLE_AREA_MAP } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignOutButton from "./SignOutButton";

// import { BsMoonFill, BsSunFill } from "react-icons/bs";
import { useAuth } from "@/hooks/useAuth";
interface SidebarProps {
  role: AppRole;
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
}

const Sidebar = ({
  role,
  collapsed,
  onToggle,
  onCloseMobile,
}: SidebarProps) => {
  const area = ROLE_AREA_MAP[role];
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      {/* Top Section */}
      <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
        {!collapsed && (
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            My App
          </h1>
        )}

        {/* Desktop collapse button */}
        <button
          onClick={onToggle}
          className="hidden rounded p-2 hover:bg-gray-100 md:flex dark:hover:bg-gray-700"
        >
          ☰
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="rounded p-2 hover:bg-gray-100 md:hidden dark:hover:bg-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {SIDEBAR_ITEMS.filter((item) => item.roles.includes(role)).map(
          (item) => {
            const to = item.path[area as keyof typeof item.path];

            return (
              <NavLink
                key={item.label}
                to={to as string}
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 ${
                    isActive ? "bg-blue-900 text-white" : "hover:bg-gray-100"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          },
        )}
        {user && (
          <div className="relative block md:hidden">
            <button className="h-10 w-10 overflow-hidden rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <NavLink to="/customer">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </NavLink>
            </button>
          </div>
        )}

        <div className="block md:hidden">{user && <SignOutButton />}</div>
      </nav>
    </div>
  );
};

export default Sidebar;
