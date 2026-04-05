import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "night" | "day";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "capsule-theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return storedTheme === "day" ? "day" : "night";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme: ThemeMode) => setThemeState(nextTheme),
      toggleTheme: () => setThemeState((current) => (current === "night" ? "day" : "night")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
