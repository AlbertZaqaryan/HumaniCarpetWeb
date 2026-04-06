import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "HumaniCarpet — Handcrafted Rugs Made with Soul",
  description:
    "Discover unique handmade rugs. Custom designs, premium quality, artistic craftsmanship. Movies, cartoons, nature, cars — any design brought to life.",
  keywords: ["handmade rugs", "custom rugs", "carpet", "tufted rugs", "art rugs"],
};

const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('hc_theme');
    var d = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
