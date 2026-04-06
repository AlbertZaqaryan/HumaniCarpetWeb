"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: "",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Nothing to checkout</h1>
        <p className="text-neutral-500 mb-8">Add items to your cart first.</p>
        <Link href="/shop">
          <Button>Browse Collection</Button>
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(
        "/orders/",
        {
          ...form,
          items: items.map((i) => ({
            rug_id: i.rug.id,
            quantity: i.quantity,
          })),
        },
        token
      );
      clearCart();
      toast.success("Order placed! We'll contact you within 24 hours.");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-8"
      >
        Checkout
      </motion.h1>

      <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>{items.length} item{items.length !== 1 ? "s" : ""}</strong> — Total:{" "}
          <strong>${totalPrice().toFixed(2)}</strong>
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
              First Name *
            </label>
            <input
              name="first_name"
              required
              value={form.first_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
              Last Name *
            </label>
            <input
              name="last_name"
              required
              value={form.last_name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
            Phone *
          </label>
          <input
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 transition-colors resize-none"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Placing Order..." : "Place Order"}
        </Button>
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          No payment required. We will contact you within 24 hours to confirm.
        </p>
      </motion.form>
    </div>
  );
}
