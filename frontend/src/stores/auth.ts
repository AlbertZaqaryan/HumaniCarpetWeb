"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password2: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("hc_access_token");
    if (token) {
      set({ token });
      get().loadUser();
    } else {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    const data = await api.post<AuthTokens>("/auth/login/", {
      username,
      password,
    });
    localStorage.setItem("hc_access_token", data.access);
    localStorage.setItem("hc_refresh_token", data.refresh);
    set({ token: data.access });
    await get().loadUser();
  },

  register: async (data) => {
    await api.post("/auth/register/", data);
  },

  logout: () => {
    localStorage.removeItem("hc_access_token");
    localStorage.removeItem("hc_refresh_token");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = get().token || localStorage.getItem("hc_access_token");
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await api.get<User>("/auth/profile/", token);
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem("hc_access_token");
      localStorage.removeItem("hc_refresh_token");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
