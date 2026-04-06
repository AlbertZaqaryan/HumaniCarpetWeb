"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { FaInstagram, FaTiktok, FaTelegram } from "react-icons/fa";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact/", form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
          Get in Touch
        </p>
        <h1 className="text-4xl font-serif font-bold text-neutral-900 dark:text-white">
          Contact Us
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-8"
        >
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Reach Out</h3>
            <div className="space-y-4">
              {[
                { icon: HiOutlineMail, text: "hello@humanicarpet.com" },
                { icon: HiOutlinePhone, text: "+1 (555) 123-4567" },
                { icon: HiOutlineLocationMarker, text: "Artisan Workshop, Creative District" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <item.icon className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Follow Us</h3>
            <div className="flex gap-3">
              {[
                { icon: FaInstagram, href: "#", label: "Instagram" },
                { icon: FaTiktok, href: "#", label: "TikTok" },
                { icon: FaTelegram, href: "#", label: "Telegram" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 flex items-center justify-center transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-5 p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Name *</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Email *</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-neutral-700 dark:text-neutral-300">Message *</label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
