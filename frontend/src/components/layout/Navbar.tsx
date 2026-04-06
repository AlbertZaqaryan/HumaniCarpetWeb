"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineSun, HiOutlineMoon, HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/custom-design", label: "Custom Design" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const { isDark, toggle } = useThemeStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-serif font-bold tracking-wider text-neutral-900 dark:text-white">
          HUMANI<span className="text-amber-700 dark:text-amber-500">CARPET</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-400 ${
                pathname === l.href
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <HiOutlineSun className="w-5 h-5 text-amber-400" />
            ) : (
              <HiOutlineMoon className="w-5 h-5 text-neutral-600" />
            )}
          </button>

          <Link href="/cart" className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <HiOutlineShoppingBag className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          <Link
            href={user ? "/profile" : "/auth/login"}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <HiOutlineUser className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <HiOutlineX className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            ) : (
              <HiOutlineMenu className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-base font-medium py-2 ${
                    pathname === l.href
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
