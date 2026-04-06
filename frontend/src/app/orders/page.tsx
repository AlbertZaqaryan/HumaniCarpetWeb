"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";
import type { Order } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
  confirmed: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (token) {
      api.get<Order[]>("/orders/mine/", token)
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, token, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-1/3 !rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-8"
      >
        My Orders
      </motion.h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-neutral-500">Order #{String(order.id).slice(0, 8)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColors[order.status] || ""}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-lg">${parseFloat(order.total).toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {item.title} <span className="text-neutral-400">x{item.quantity}</span>
                    </span>
                    <span className="font-medium">${parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
