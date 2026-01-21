export interface SignInFormData {
  email: string;
  password: string;
}

export type SignUpFormData = {
  fullName: string;
  email: string;
  password: string;
  country: string;
  phoneNumber?: string;
  terms_agree: boolean;
};

export type StoredRole = "superAdmin" | "admin" | "employee" | "customer";

// Runtime roles (includes derived guest state)
export type AppRole = StoredRole | "guest";

export interface UserProfile {
  id: string;
  user_id: string;
  role: StoredRole;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  age: number | null;
  country: string | null; // AE, US, etc.
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  age?: number;
  country?: string;
}

export type AppArea = "public" | "customer" | "admin" | "guest";
// access-map.ts

export const ROLE_AREA_MAP: Record<AppRole, AppArea> = {
  guest: "guest",
  customer: "customer",
  employee: "admin",
  admin: "admin",
  superAdmin: "admin",
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: string | null;
}
