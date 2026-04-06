"use client";

import { motion } from "framer-motion";
import { HiOutlineSparkles, HiOutlineHand, HiOutlineHeart } from "react-icons/hi";

const features = [
  {
    icon: HiOutlineHand,
    title: "100% Handmade",
    desc: "Every rug is crafted by skilled artisans using traditional tufting techniques.",
  },
  {
    icon: HiOutlineSparkles,
    title: "Unique Designs",
    desc: "From anime to nature — we bring your vision to life in textured carpet art.",
  },
  {
    icon: HiOutlineHeart,
    title: "Made with Love",
    desc: "Each piece carries the soul of its maker and the story of its design.",
  },
];

export default function BrandIntro({ aboutShort }: { aboutShort?: string }) {
  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
            Our Craft
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
            Why HumaniCarpet?
          </h2>
          {aboutShort && (
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {aboutShort}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-white dark:bg-neutral-800/50 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <f.icon className="w-7 h-7 text-amber-700 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
