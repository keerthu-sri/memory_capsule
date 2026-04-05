import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isNight = theme === "night";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isNight ? "Switch to calm dark mode" : "Switch to night mode"}
      title={isNight ? "Switch to calm dark mode" : "Switch to night mode"}
    >
      {isNight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span>{isNight ? "Calm Mode" : "Night Mode"}</span>
    </button>
  );
};
