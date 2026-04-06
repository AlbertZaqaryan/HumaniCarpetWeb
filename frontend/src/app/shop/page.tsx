"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { HiOutlineAdjustments, HiOutlineX } from "react-icons/hi";
import ProductCard from "@/components/ui/ProductCard";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Category, Rug, PaginatedResponse } from "@/lib/types";

const SORT_OPTIONS = [
  { label: "Newest", value: "-created_at" },
  { label: "Price: Low → High", value: "price" },
  { label: "Price: High → Low", value: "-price" },
  { label: "A → Z", value: "title" },
];

export default function ShopPage() {
  const [rugs, setRugs] = useState<Rug[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-created_at");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchRugs = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("ordering", sort);
      if (category) params.set("category", category);
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      if (search) params.set("search", search);

      try {
        const data = await api.get<PaginatedResponse<Rug>>(
          `/rugs/?${params.toString()}`
        );
        setRugs((prev) => (append ? [...prev, ...data.results] : data.results));
        setHasMore(!!data.next);
      } catch {
        /* handled */
      }
      setLoading(false);
    },
    [category, sort, minPrice, maxPrice, search]
  );

  useEffect(() => {
    api.get<Category[]>("/categories/").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    fetchRugs(1);
  }, [fetchRugs]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchRugs(next, true);
  };

  const clearFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSort("-created_at");
  };

  const hasActiveFilters = category || minPrice || maxPrice || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white">
          Our Collection
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Browse our handcrafted rugs or find the perfect piece for you.
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 transition-colors text-sm font-medium cursor-pointer"
        >
          <HiOutlineAdjustments className="w-4 h-4" />
          Filters
        </button>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rugs..."
          className="px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm flex-1 min-w-[200px] focus:outline-none focus:border-amber-500"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-sm cursor-pointer focus:outline-none focus:border-amber-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
              {o.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <HiOutlineX className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-8 p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
              >
                <option value="" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                    {c.name} ({c.rug_count})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Min Price ($)
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                Max Price ($)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="1000"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 text-sm"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid */}
      {loading && rugs.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2 !rounded-lg" />
              <Skeleton className="h-5 w-1/3 !rounded-lg" />
            </div>
          ))}
        </div>
      ) : rugs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            No rugs found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rugs.map((rug) => (
              <ProductCard key={rug.id} rug={rug} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 text-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
