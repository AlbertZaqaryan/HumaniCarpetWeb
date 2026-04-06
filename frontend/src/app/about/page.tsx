"use client";

import { motion } from "framer-motion";
import { HiOutlineSparkles, HiOutlineCube, HiOutlineColorSwatch, HiOutlineScissors } from "react-icons/hi";

const steps = [
  { icon: HiOutlineSparkles, title: "Design", desc: "Every rug starts with a concept — from pop culture to customer imagination." },
  { icon: HiOutlineColorSwatch, title: "Color Selection", desc: "We hand-pick premium acrylic yarns in the perfect palette for each design." },
  { icon: HiOutlineScissors, title: "Hand Tufting", desc: "Using a tufting gun on stretched canvas, artisans bring the design to life loop by loop." },
  { icon: HiOutlineCube, title: "Finishing", desc: "Latex backing, trimming, carving details, and quality inspection before shipping." },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
          Our Story
        </p>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-neutral-900 dark:text-white mb-6">
          Crafted by Hand,<br />Designed with Heart
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed text-lg">
          HumaniCarpet was born from a passion for textile art. We believe that every floor deserves 
          a masterpiece — and every home deserves something truly unique. Our rugs are not mass-produced; 
          they are hand-tufted with care, patience, and love for the craft.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-neutral-900/50 p-10"
        >
          <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-white mb-3">Our Mission</h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            To transform spaces through handmade carpet art — turning your favorite characters, 
            memories, and ideas into soft, tangible pieces you walk on every day.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800/50 dark:to-neutral-900/50 p-10"
        >
          <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-white mb-3">Quality Promise</h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Premium acrylic yarn, anti-slip latex backing, meticulous detail carving, 
            and a satisfaction guarantee on every single rug we create.
          </p>
        </motion.div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white text-center mb-12">
          How It&apos;s Made
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <step.icon className="w-7 h-7 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">STEP {i + 1}</div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
