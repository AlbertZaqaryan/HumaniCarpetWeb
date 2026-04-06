"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiOutlineShoppingBag, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import Skeleton from "@/components/ui/Skeleton";
import { api, mediaUrl } from "@/lib/api";
import { useCartStore } from "@/stores/cart";
import type { RugDetail, Rug } from "@/lib/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [rug, setRug] = useState<RugDetail | null>(null);
  const [related, setRelated] = useState<Rug[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.get<RugDetail>(`/rugs/${slug}/`),
      api.get<Rug[]>(`/rugs/${slug}/related/`).catch(() => []),
    ]).then(([r, rel]) => {
      setRug(r);
      setRelated(rel);
      setActiveImage(0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 !rounded-lg" />
            <Skeleton className="h-6 w-1/4 !rounded-lg" />
            <Skeleton className="h-32 !rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!rug) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold">Product not found</h2>
      </div>
    );
  }

  const allImages = [rug.image, ...rug.images.map((img) => img.image)];

  const handleAddToCart = () => {
    addItem(rug);
    toast.success(`${rug.title} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <Image
              src={mediaUrl(allImages[activeImage])}
              alt={rug.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((p) => (p === 0 ? allImages.length - 1 : p - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-neutral-900/80 p-2 rounded-xl cursor-pointer"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImage((p) => (p === allImages.length - 1 ? 0 : p + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-neutral-900/80 p-2 rounded-xl cursor-pointer"
                  aria-label="Next image"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-colors ${
                    i === activeImage
                      ? "border-amber-600"
                      : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <Image src={mediaUrl(img)} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          {rug.category_name && (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 tracking-wide uppercase mb-2">
              {rug.category_name}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white">
            {rug.title}
          </h1>
          <p className="text-3xl font-bold text-amber-700 dark:text-amber-400 mt-4">
            ${parseFloat(rug.price).toFixed(2)}
          </p>
          {rug.description && (
            <p className="mt-6 text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {rug.description}
            </p>
          )}
          <div className="mt-8">
            <Button size="lg" onClick={handleAddToCart} className="w-full sm:w-auto flex items-center gap-2">
              <HiOutlineShoppingBag className="w-5 h-5" />
              Add to Cart
            </Button>
          </div>
          <div className="mt-8 p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Material</span>
                <p className="font-medium mt-1">Premium Acrylic Yarn</p>
              </div>
              <div>
                <span className="text-neutral-500">Technique</span>
                <p className="font-medium mt-1">Hand Tufted</p>
              </div>
              <div>
                <span className="text-neutral-500">Backing</span>
                <p className="font-medium mt-1">Anti-slip Latex</p>
              </div>
              <div>
                <span className="text-neutral-500">Care</span>
                <p className="font-medium mt-1">Spot Clean</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((r) => (
              <ProductCard key={r.id} rug={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
