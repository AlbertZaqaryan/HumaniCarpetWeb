"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { mediaUrl } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

export default function Hero({ settings }: { settings: SiteSettings | null }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {settings?.hero_image && (
        <Image
          src={mediaUrl(settings.hero_image)}
          alt="Hero"
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/50 to-neutral-950/80" />
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight"
        >
          {settings?.hero_title || "Handcrafted Rugs, Made with Soul"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-xl mx-auto leading-relaxed"
        >
          {settings?.hero_subtitle ||
            "Each piece tells a story — woven by hand, designed with love."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/shop">
            <Button size="lg">{settings?.hero_cta_text || "Explore Collection"}</Button>
          </Link>
          <Link href="/custom-design">
            <Button variant="outline" size="lg" className="!border-white/30 !text-white hover:!bg-white/10">
              Custom Design
            </Button>
          </Link>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
