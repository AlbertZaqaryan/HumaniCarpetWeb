"use client";

import { create } from "zustand";
import type { Rug, CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (rug: Rug) => void;
  removeItem: (rugId: string) => void;
  updateQuantity: (rugId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  hydrate: () => void;
}

function persist(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("hc_cart", JSON.stringify(items));
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("hc_cart");
      if (raw) {
        set({ items: JSON.parse(raw) });
      }
    } catch {
      /* ignore corrupt data */
    }
  },

  addItem: (rug) => {
    const items = get().items;
    const existing = items.find((i) => i.rug.id === rug.id);
    let next: CartItem[];
    if (existing) {
      next = items.map((i) =>
        i.rug.id === rug.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      next = [...items, { rug, quantity: 1 }];
    }
    set({ items: next });
    persist(next);
  },

  removeItem: (rugId) => {
    const next = get().items.filter((i) => i.rug.id !== rugId);
    set({ items: next });
    persist(next);
  },

  updateQuantity: (rugId, quantity) => {
    if (quantity < 1) return get().removeItem(rugId);
    const next = get().items.map((i) =>
      i.rug.id === rugId ? { ...i, quantity } : i
    );
    set({ items: next });
    persist(next);
  },

  clearCart: () => {
    set({ items: [] });
    persist([]);
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () =>
    get().items.reduce(
      (sum, i) => sum + parseFloat(i.rug.price) * i.quantity,
      0
    ),
}));
