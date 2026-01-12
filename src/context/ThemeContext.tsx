import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { updateProfile } from "@/features/profile/actions/profile.actions";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();

  // 👇 Initial theme: DB (logged in) → localStorage → light
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  // 🔁 Sync theme when profile loads (login / refresh)
  useEffect(() => {
    if (user && profile?.theme) {
      setTheme(profile.theme);
    }
  }, [user, profile?.theme]);

  // 🎨 Apply theme globally
  useEffect(() => {
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // Guest users → persist locally
    if (!user) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, user]);

  // 🔘 Toggle logic
  const toggleTheme = async () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme); // instant UI

    if (!user || !profile) {
      // 👤 Guest → local only
      localStorage.setItem("theme", nextTheme);
      return;
    }

    // 👤 Logged in → DB
    await updateProfile(profile.id, { theme: nextTheme });
    refetch();
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
};
