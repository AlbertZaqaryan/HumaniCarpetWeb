"use client";

import Link from "next/link";
import { HiOutlineMail } from "react-icons/hi";
import { FaInstagram, FaTiktok, FaTelegram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-white tracking-wider mb-4">
              HUMANI<span className="text-amber-500">CARPET</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-md">
              Handcrafted rugs made with soul. Each piece is a unique work of art,
              designed to bring warmth and personality to your space.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Navigate</h4>
            <div className="flex flex-col gap-2">
              {[
                { href: "/shop", label: "Shop" },
                { href: "/custom-design", label: "Custom Design" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-sm hover:text-amber-400 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: FaInstagram, href: "#", label: "Instagram" },
                { icon: FaTiktok, href: "#", label: "TikTok" },
                { icon: FaTelegram, href: "#", label: "Telegram" },
                { icon: HiOutlineMail, href: "mailto:hello@humanicarpet.com", label: "Email" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-800 hover:bg-amber-600 flex items-center justify-center transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 mt-12 pt-6 text-center text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} HumaniCarpet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
