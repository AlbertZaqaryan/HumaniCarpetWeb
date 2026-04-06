"use client";

import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("hc_theme");
    const prefersDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    set({ isDark: prefersDark });
    document.documentElement.classList.toggle("dark", prefersDark);
  },

  toggle: () => {
    const next = !get().isDark;
    set({ isDark: next });
    localStorage.setItem("hc_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  },
}));
