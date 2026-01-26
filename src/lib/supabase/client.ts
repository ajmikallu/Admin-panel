// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Runtime validation
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing Supabase env vars: ${!supabaseUrl ? "VITE_SUPABASE_URL" : ""} ${!supabaseKey ? "VITE_SUPABASE_ANON_KEY" : ""}` +
      `\nCheck: ${import.meta.env.DEV ? ".env.development or .env.local" : ".env.production"}`,
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Dev logging only
if (import.meta.env.DEV) {
  console.log("🔧 Supabase client ready");
  console.log("📍 URL:", supabaseUrl);
  console.log("🔑 Key loaded ✓");
}
