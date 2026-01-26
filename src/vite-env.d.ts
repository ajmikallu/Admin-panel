/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Supabase project URL
   * @example https://your-project.supabase.co
   */
  readonly VITE_SUPABASE_URL: string;

  /**
   * Supabase publishable key (preferred)
   * This is safe to expose in frontend code
   */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;

  /**
   * Supabase anonymous key (fallback)
   * This is safe to expose in frontend code
   * Only used if VITE_SUPABASE_PUBLISHABLE_KEY is not set
   */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
