"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import ProductCard from "@/components/ui/ProductCard";
import type { Rug } from "@/lib/types";

export default function FeaturedSlider({ rugs }: { rugs: Rug[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!rugs.length) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
            Curated Selection
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white">
            Featured Rugs
          </h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {rugs.map((rug) => (
          <div key={rug.id} className="min-w-[260px] sm:min-w-[300px] snap-start">
            <ProductCard rug={rug} />
          </div>
        ))}
      </div>
    </section>
  );
}
