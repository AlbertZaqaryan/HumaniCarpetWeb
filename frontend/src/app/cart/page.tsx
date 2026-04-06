"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineTrash, HiMinus, HiPlus } from "react-icons/hi";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/stores/cart";
import { mediaUrl } from "@/lib/api";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-6xl mb-6">🧶</div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">
            Discover our handcrafted rugs and add something special.
          </p>
          <Link href="/shop">
            <Button>Browse Collection</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-10"
      >
        Shopping Cart
      </motion.h1>

      <div className="space-y-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.rug.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex gap-4 sm:gap-6 p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={mediaUrl(item.rug.image)}
                  alt={item.rug.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/shop/${item.rug.slug}`}
                  className="font-semibold text-neutral-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 transition-colors truncate block"
                >
                  {item.rug.title}
                </Link>
                <p className="text-amber-700 dark:text-amber-400 font-bold mt-1">
                  ${parseFloat(item.rug.price).toFixed(2)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.rug.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <HiMinus className="w-3 h-3" />
                  </button>
                  <span className="font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.rug.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <HiPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.rug.id)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label="Remove item"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
                <p className="font-bold text-neutral-900 dark:text-white">
                  ${(parseFloat(item.rug.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-8 p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium text-neutral-600 dark:text-neutral-400">Total</span>
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
            ${totalPrice().toFixed(2)}
          </span>
        </div>
        <Link href="/checkout" className="block">
          <Button size="lg" className="w-full">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
