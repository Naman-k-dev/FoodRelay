"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  useEffect(() => {
    const saved = localStorage.getItem("foodrelay_theme") as "system" | "light" | "dark" | null;
    const initial = saved || "system";
    setTheme(initial);
    applyTheme(initial);

    // System theme change listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = localStorage.getItem("foodrelay_theme");
      if (!current || current === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const applyTheme = (mode: "system" | "light" | "dark") => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else if (mode === "light") {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    }
  };

  const handleSelect = (mode: "system" | "light" | "dark") => {
    setTheme(mode);
    localStorage.setItem("foodrelay_theme", mode);
    applyTheme(mode);
  };

  return (
    <div className="inline-flex items-center p-0.5 bg-canvas-subtle rounded-md border border-studio-border">
      <button
        onClick={() => handleSelect("light")}
        aria-label="Light mode"
        title="Light mode"
        className={`p-1 rounded text-xs transition-colors ${
          theme === "light"
            ? "bg-studio-surface text-studio-tangerine shadow-subtle font-medium"
            : "text-studio-text-muted hover:text-studio-text"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleSelect("dark")}
        aria-label="Dark mode"
        title="Dark mode"
        className={`p-1 rounded text-xs transition-colors ${
          theme === "dark"
            ? "bg-studio-surface text-studio-indigo shadow-subtle font-medium"
            : "text-studio-text-muted hover:text-studio-text"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleSelect("system")}
        aria-label="System mode"
        title="System mode"
        className={`p-1 rounded text-xs transition-colors ${
          theme === "system"
            ? "bg-studio-surface text-studio-text shadow-subtle font-medium"
            : "text-studio-text-muted hover:text-studio-text"
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
