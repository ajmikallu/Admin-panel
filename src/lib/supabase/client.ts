import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime validation with helpful error messages
if (!supabaseUrl || !supabaseKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL");
  if (!supabaseKey) {
    if (
      !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
      !import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      missingVars.push(
        "VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY",
      );
    }
  }
  throw new Error(
    `Missing Supabase environment variables: ${missingVars.join(", ")}. ` +
      `Please check your .env files (${import.meta.env.DEV ? ".env.development or .env.local" : ".env.production"})`,
  );
}

// Development mode logging
if (import.meta.env.DEV) {
  console.log("🔧 Supabase client initialized in development mode");
  console.log("📍 Supabase URL:", supabaseUrl);
  console.log("🔑 Using key:", supabaseKey.substring(0, 20) + "...");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
