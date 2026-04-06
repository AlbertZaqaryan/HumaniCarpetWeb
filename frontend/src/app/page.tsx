"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/home/Hero";
import FeaturedSlider from "@/components/home/FeaturedSlider";
import BrandIntro from "@/components/home/BrandIntro";
import Skeleton from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { SiteSettings, Rug } from "@/lib/types";

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [featured, setFeatured] = useState<Rug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<SiteSettings>("/settings/").catch(() => null),
      api.get<Rug[]>("/rugs/featured/").catch(() => []),
    ]).then(([s, f]) => {
      setSettings(s);
      setFeatured(f);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-[90vh] !rounded-none" />
        <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero settings={settings} />
      <FeaturedSlider rugs={featured} />
      <BrandIntro aboutShort={settings?.about_short} />
    </>
  );
}
