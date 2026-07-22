import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/site/ProductCard";
import { Filter, X } from "lucide-react";

const SORTS = [
  { v: "newest", l: "Newest" },
  { v: "price_asc", l: "Price ↑" },
  { v: "price_desc", l: "Price ↓" },
  { v: "name_asc", l: "A → Z" },
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get("category") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "newest";
  const minPrice = params.get("min_price") || "";
  const maxPrice = params.get("max_price") || "";
  const size = params.get("size") || "";
  const color = params.get("color") || "";

  useEffect(() => {
    api.get("/products/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = {};
    if (category) q.category = category;
    if (search) q.search = search;
    if (sort) q.sort = sort;
    if (minPrice) q.min_price = minPrice;
    if (maxPrice) q.max_price = maxPrice;
    if (size) q.size = size;
    if (color) q.color = color;
    api.get("/products", { params: q }).then((r) => setProducts(r.data)).finally(() => setLoading(false));
  }, [category, search, sort, minPrice, maxPrice, size, color]);

  const setParam = (k, v) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p);
  };

  const sizes = useMemo(() => ["XS", "S", "M", "L", "XL"], []);
  const colorSet = useMemo(() => {
    const s = new Set();
    products.forEach((p) => (p.colors || []).forEach((c) => s.add(c)));
    return Array.from(s).slice(0, 12);
  }, [products]);

  const activeCount = [category, search, minPrice, maxPrice, size, color].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-8" data-testid="shop-filters">
      <div>
        <div className="font-mono-caps mb-3">Category</div>
        <div className="space-y-2">
          <button className={`block w-full text-left py-1 ${!category ? "font-bold" : "hover:text-[#D9381E]"}`} onClick={() => setParam("category", "")} data-testid="filter-cat-all">All</button>
          {categories.map((c) => (
            <button key={c} className={`block w-full text-left py-1 ${category === c ? "font-bold" : "hover:text-[#D9381E]"}`} onClick={() => setParam("category", c)} data-testid={`filter-cat-${c}`}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="font-mono-caps mb-3">Price</div>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setParam("min_price", e.target.value)} className="w-full border border-black px-2 py-1.5 text-sm outline-none" data-testid="filter-min-price" />
          <span>—</span>
          <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setParam("max_price", e.target.value)} className="w-full border border-black px-2 py-1.5 text-sm outline-none" data-testid="filter-max-price" />
        </div>
      </div>
      <div>
        <div className="font-mono-caps mb-3">Size</div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button key={s} onClick={() => setParam("size", size === s ? "" : s)} className={`border border-black w-10 h-10 text-sm ${size === s ? "bg-black text-white" : "hover:bg-black hover:text-white"}`} data-testid={`filter-size-${s}`}>{s}</button>
          ))}
        </div>
      </div>
      {colorSet.length > 0 && (
        <div>
          <div className="font-mono-caps mb-3">Color</div>
          <div className="flex flex-wrap gap-2">
            {colorSet.map((c) => (
              <button key={c} onClick={() => setParam("color", color === c ? "" : c)} className={`border border-black px-3 py-1 text-xs ${color === c ? "bg-black text-white" : "hover:bg-black hover:text-white"}`} data-testid={`filter-color-${c}`}>{c}</button>
            ))}
          </div>
        </div>
      )}
      {activeCount > 0 && (
        <button onClick={() => setParams({})} className="w-full border border-black px-4 py-2 font-mono-caps hover:bg-black hover:text-white" data-testid="filter-clear">Clear all ({activeCount})</button>
      )}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12" data-testid="shop-page">
      <div className="mb-10">
        <div className="font-mono-caps text-black/50 mb-2">Shop {category ? `— ${category}` : "— All"}</div>
        <h1 className="font-display text-5xl md:text-7xl">{search ? `"${search}"` : (category || "The Collection")}</h1>
      </div>

      <div className="flex items-center justify-between border-y border-black py-3 mb-6">
        <button className="lg:hidden inline-flex items-center gap-2 font-mono-caps" onClick={() => setFiltersOpen(true)} data-testid="mobile-filters-btn">
          <Filter size={14} /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        <div className="font-mono-caps text-black/50" data-testid="shop-count">{products.length} pieces</div>
        <div className="flex items-center gap-2">
          <span className="font-mono-caps text-black/50 hidden sm:inline">Sort</span>
          <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="border border-black px-3 py-1.5 text-sm bg-white" data-testid="shop-sort">
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-28 pr-4"><FilterPanel /></div>
        </aside>
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-black/10">
              {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="aspect-[3/4] bg-[#F5F5F5] animate-pulse" />))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-black p-12 text-center">
              <div className="font-display text-3xl mb-2">Nothing here yet</div>
              <p className="text-black/60">Try broadening your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-black/10">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto" data-testid="mobile-filters-drawer">
          <div className="flex justify-between items-center p-4 border-b border-black">
            <div className="font-display text-2xl">Filter</div>
            <button onClick={() => setFiltersOpen(false)}><X /></button>
          </div>
          <div className="p-4"><FilterPanel /></div>
          <div className="p-4"><button onClick={() => setFiltersOpen(false)} className="w-full bg-black text-white py-3 font-mono-caps">Apply</button></div>
        </div>
      )}
    </div>
  );
}
