import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import ProductCard from "@/components/site/ProductCard";
import { ArrowRight } from "lucide-react";

const CATEGORY_TILES = [
  { name: "Outerwear", img: "https://images.pexels.com/photos/8346043/pexels-photo-8346043.jpeg", tag: "Winter'26" },
  { name: "Dresses", img: "https://images.pexels.com/photos/9121191/pexels-photo-9121191.jpeg", tag: "New" },
  { name: "Accessories", img: "https://images.pexels.com/photos/17435382/pexels-photo-17435382.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", tag: "Curated" },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/products", { params: { featured: true, limit: 8 } }).then((r) => setFeatured(r.data));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO - asymmetric split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
        <div className="lg:col-span-5 p-8 md:p-14 flex flex-col justify-between bg-white relative overflow-hidden">
          <div className="font-mono-caps text-black/50">Collection N°44 — Winter 2026</div>
          <div>
            <h1 className="font-display text-[15vw] lg:text-[8vw] leading-[0.85] mb-6" data-testid="hero-title">
              Wear<br />the<br />silence.
            </h1>
            <p className="max-w-md text-black/70 mb-8">
              A rigorously edited wardrobe for those who consider clothing a personal architecture. Pieces are cut once, in small runs, then never repeated.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-mono-caps hover:bg-[#D9381E]" data-testid="hero-shop-btn">
                Enter the shop <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=Outerwear" className="inline-flex items-center gap-2 border border-black px-8 py-4 font-mono-caps hover:bg-black hover:text-white">
                See outerwear
              </Link>
            </div>
          </div>
          <div className="font-mono-caps text-black/40 mt-10">01 / Editorial · 02 / Craft · 03 / Restraint</div>
        </div>
        <div className="lg:col-span-7 relative min-h-[70vh]">
          <img src="https://images.pexels.com/photos/28609628/pexels-photo-28609628.jpeg" alt="Editorial hero" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-4 py-3 font-mono-caps text-xs" data-testid="hero-badge">
            Featured — Runway Statement Dress
          </div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-4xl md:text-6xl">Shop by chapter</h2>
          <Link to="/shop" className="hidden md:inline font-mono-caps hover:text-[#D9381E]">All chapters →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black">
          {CATEGORY_TILES.map((c) => (
            <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="group relative bg-white overflow-hidden" data-testid={`category-tile-${c.name}`}>
              <div className="aspect-[3/4]">
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="font-mono-caps text-white/80">{c.tag}</div>
                <div className="font-display text-3xl">{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono-caps text-black/50 mb-2">Studio picks</div>
            <h2 className="font-display text-4xl md:text-6xl">Objects of desire</h2>
          </div>
          <Link to="/shop" className="hidden md:inline font-mono-caps hover:text-[#D9381E]">See all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} wide={i === 0} />
          ))}
        </div>
      </section>

      {/* Studio band */}
      <section className="bg-[#0A0A0A] text-white py-24 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono-caps text-white/50 mb-4">Manifesto</div>
            <h3 className="font-display text-4xl md:text-6xl mb-6">Clothing as architecture. Nothing decorative.</h3>
            <p className="text-white/70 max-w-lg leading-relaxed">
              We work with three ateliers across Porto, Milano and Kyoto. Every seam, every hem, every buttonhole is a
              decision we can defend. Nothing is made twice.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-white/10 text-center">
            {[
              ["03", "Ateliers"],
              ["44", "Pieces / season"],
              ["100%", "Traceable fabrics"],
            ].map(([k, v]) => (
              <div key={v} className="bg-[#0A0A0A] py-10">
                <div className="font-display text-5xl md:text-6xl">{k}</div>
                <div className="font-mono-caps text-white/60 mt-2">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
