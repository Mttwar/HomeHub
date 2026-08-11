"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const themeChangeEvent = "casahub-theme-change";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    if (localStorage.getItem("casahub-theme")) return;
    document.documentElement.dataset.theme = media.matches ? "dark" : "light";
    document.documentElement.style.colorScheme = media.matches ? "dark" : "light";
    onStoreChange();
  };

  window.addEventListener(themeChangeEvent, onStoreChange);
  media.addEventListener("change", syncSystemTheme);
  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    media.removeEventListener("change", syncSystemTheme);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light");

  const toggleTheme = () => {
    const nextTheme: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("casahub-theme", nextTheme);
    window.dispatchEvent(new Event(themeChangeEvent));
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle motion-control"
      aria-label={isDark ? "Passa al tema chiaro" : "Passa al tema scuro"}
      aria-pressed={isDark}
      title={isDark ? "Tema scuro attivo" : "Tema chiaro attivo"}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">{isDark ? <Moon /> : <Sun />}</span>
      </span>
      <span className="hidden text-xs font-bold sm:inline">{isDark ? "Scuro" : "Chiaro"}</span>
    </button>
  );
}
