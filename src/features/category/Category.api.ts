// src/api/category.api.ts
import { supabase } from "@/lib/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Public: fetch all categories
 * Optionally, you can filter by parent_id
 */
export async function getCategories(parentId?: string | null) {
  let query = supabase.from("categories").select("*");

  if (parentId !== undefined) {
    query = query.eq("parent_id", parentId);
  }

  return query.order("name", { ascending: true });
}

/**
 * Public: get single category by slug
 */
export async function getCategoryBySlug(slug: string) {
  return supabase.from("categories").select("*").eq("slug", slug).single();
}

/**
 * Staff/Admin: create new category
 */
export async function createCategory(data: Partial<Category>) {
  return supabase.from("categories").insert(data).select().single();
}

/**
 * Staff/Admin: update category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<Category>,
) {
  return supabase
    .from("categories")
    .update(data)
    .eq("id", categoryId)
    .select()
    .single();
}

/**
 * Admin/SuperAdmin: delete category
 */
export async function deleteCategory(categoryId: string) {
  return supabase.from("categories").delete().eq("id", categoryId);
}
