import React from "react";
import { Link } from "react-router-dom";
import { money } from "@/lib/api";

export default function ProductCard({ product, wide = false, index = 0 }) {
  const discount = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link
      to={`/products/${product.id}`}
      className={`group block border border-black/10 hover:border-black bg-white ${wide ? "md:col-span-2" : ""}`}
      data-testid={`product-card-${product.id}`}
      style={{ animation: `fadeInUp .5s ease ${Math.min(index, 8) * 60}ms both` }}
    >
      <div className="relative overflow-hidden bg-[#F5F5F5]" style={{ aspectRatio: wide ? "16/10" : "3/4" }}>
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />
        {discount && (
          <div className="absolute top-3 left-3 bg-[#D9381E] text-white px-2 py-1 font-mono-caps text-[10px]" data-testid={`product-sale-${product.id}`}>
            Sale
          </div>
        )}
        {product.featured && !discount && (
          <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 font-mono-caps text-[10px]">Studio Pick</div>
        )}
      </div>
      <div className="p-4 border-t border-black/10">
        <div className="font-mono-caps text-black/50 mb-1">{product.category}</div>
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold leading-snug line-clamp-2">{product.name}</div>
          <div className="text-right shrink-0">
            <div className="font-semibold" data-testid={`product-price-${product.id}`}>{money(product.price)}</div>
            {discount && <div className="text-xs text-black/40 line-through">{money(product.compare_at_price)}</div>}
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </Link>
  );
}
