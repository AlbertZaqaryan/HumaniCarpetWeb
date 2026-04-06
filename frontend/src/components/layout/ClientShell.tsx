"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useThemeStore } from "@/stores/theme";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
    hydrateCart();
    hydrateAuth();
  }, [hydrateTheme, hydrateCart, hydrateAuth]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "!bg-white dark:!bg-neutral-800 !text-neutral-900 dark:!text-white !shadow-xl !rounded-2xl !px-4 !py-3",
          duration: 3000,
        }}
      />
    </>
  );
}
