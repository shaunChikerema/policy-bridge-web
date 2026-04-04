//src\context\theme-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
  systemTheme: "light" | "dark";
  isLoaded: boolean;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "light", // Default to light for professional use
  storageKey = "policybridge-theme", // FIXED: Match the key from layout.tsx
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Load theme from storage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch {
      // Silently fail - use default theme
    }
    setMounted(true);
  }, [storageKey]);

  // Calculate resolved theme
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = resolvedTheme === "dark";

  // Apply theme
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Apply theme with proper attributes
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }

    // Save to storage
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Silently fail
    }
  }, [theme, resolvedTheme, mounted, storageKey]);

  const handleSetTheme = (newTheme: Theme) => {
    if (["light", "dark", "system"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme,
    toggleTheme,
    systemTheme,
    isLoaded: mounted,
    isDarkMode,
  };

  // Prevent hydration mismatch - show children immediately but with proper theme
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Simple theme toggle component with proper styling
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { toggleTheme, resolvedTheme, isLoaded } = useTheme();

  // Don't render until mounted to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <div
        className={`w-9 h-9 rounded-md border border-border bg-card ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center w-9 h-9
        rounded-md border border-border bg-card text-card-foreground
        hover:bg-accent hover:text-accent-foreground 
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        transition-colors duration-200 ${className}
      `}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${
        resolvedTheme === "dark" ? "light" : "dark"
      } mode`}
    >
      {resolvedTheme === "dark" ? (
        // Sun icon for light mode
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  );
}

// Professional theme selector dropdown with proper theme colors
export function ThemeSelector({ className = "" }: { className?: string }) {
  const { theme, setTheme, isLoaded } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const currentTheme = themes.find((t) => t.value === theme);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  // Don't render until mounted
  if (!isLoaded) {
    return (
      <div
        className={`w-full h-9 rounded-md border border-border bg-card ${className}`}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="
          inline-flex items-center justify-between w-full px-3 py-2
          text-sm font-medium bg-card border border-border rounded-md
          text-card-foreground hover:bg-accent hover:text-accent-foreground 
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-colors duration-200
        "
        aria-expanded={isOpen}
      >
        <span>{currentTheme?.label}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
          absolute right-0 z-50 mt-1 w-full min-w-[120px]
          bg-popover border border-border rounded-md shadow-lg
        "
        >
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 text-sm text-left 
                hover:bg-accent hover:text-accent-foreground 
                transition-colors duration-150
                ${
                  theme === themeOption.value
                    ? "bg-primary text-primary-foreground"
                    : "text-popover-foreground"
                }
                ${themeOption === themes[0] ? "rounded-t-md" : ""}
                ${
                  themeOption === themes[themes.length - 1]
                    ? "rounded-b-md"
                    : ""
                }
              `}
            >
              {themeOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeProvider;
