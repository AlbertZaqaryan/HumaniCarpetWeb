"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiOutlineShoppingBag } from "react-icons/hi";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/cart";
import { mediaUrl } from "@/lib/api";
import type { Rug } from "@/lib/types";

export default function ProductCard({ rug }: { rug: Rug }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(rug);
    toast.success(`${rug.title} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link href={`/shop/${rug.slug}`} className="block">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-4">
          <Image
            src={mediaUrl(rug.image)}
            alt={rug.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="absolute bottom-4 right-4 bg-white dark:bg-neutral-900 p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            aria-label="Add to cart"
          >
            <HiOutlineShoppingBag className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </motion.button>
        </div>
        <div className="px-1">
          {rug.category_name && (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-1">
              {rug.category_name}
            </p>
          )}
          <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
            {rug.title}
          </h3>
          <p className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mt-1">
            ${parseFloat(rug.price).toFixed(2)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
