// sidebar.config.ts
import { FiHome } from "react-icons/fi";
import { FaRegUser, FaBlog } from "react-icons/fa";
import type { IconType } from "react-icons";
import type { AppRole } from "./types/models";
import { MessageSquare, type LucideIcon } from "lucide-react";
export interface SidebarItem {
  label: string;
  path: Partial<Record<"customer" | "admin", string>>;
  icon: IconType | LucideIcon;
  roles: AppRole[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    path: {
      customer: "/customer",
      admin: "/admin",
    },
    icon: FiHome,
    roles: ["customer", "employee", "admin", "superAdmin"],
  },
  {
    label: "Profile",
    path: {
      customer: "/customer/profile",
      admin: "/admin/profile",
    },
    icon: FaRegUser,
    roles: ["customer", "employee", "admin", "superAdmin"],
  },
  {
    label: "Blogs",
    path: {
      customer: "/blogs",
      admin: "/admin/blogs",
    },
    icon: FaBlog,
    roles: ["customer", "employee", "admin", "superAdmin"],
  },
  {
    label: "Blog Comments",
    icon: MessageSquare,
    roles: ["admin", "superAdmin"],
    path: {
      admin: "/admin/blogs/comments",
    },
  },
  {
    label: "Categories",
    path: {
      admin: "/admin/categories",
    },
    icon: FaBlog,
    roles: ["admin", "superAdmin"],
  },
];
