import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { money } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ArrowRight } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selSize, setSelSize] = useState(null);
  const [selColor, setSelColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [related, setRelated] = useState([]);
  const [err, setErr] = useState("");
  const { add } = useCart();

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setSelSize(r.data.sizes?.[0] || null);
      setSelColor(r.data.colors?.[0] || null);
      setImgIdx(0);
      api.get("/products", { params: { category: r.data.category, limit: 4 } }).then((rr) => {
        setRelated(rr.data.filter((p) => p.id !== r.data.id).slice(0, 4));
      });
    });
  }, [id]);

  if (!product) return <div className="min-h-[60vh] flex items-center justify-center font-mono-caps">Loading…</div>;

  const images = product.images?.length ? product.images : ["https://placehold.co/900x1200"];
  const handleAdd = async () => {
    if (product.sizes?.length && !selSize) { setErr("Please select a size"); return; }
    setErr("");
    await add({ product_id: product.id, size: selSize, color: selColor, quantity: qty });
  };

  return (
    <div data-testid="product-detail-page">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 font-mono-caps text-xs text-black/50">
        <Link to="/shop" className="hover:text-black">Shop</Link>
        <span className="mx-2">/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-black">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-black">{product.name}</span>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 grid lg:grid-cols-12 gap-8 pb-16">
        {/* Gallery */}
        <div className="lg:col-span-8 space-y-1">
          <div className="bg-[#F5F5F5] overflow-hidden" style={{ aspectRatio: "4/5" }}>
            <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" data-testid="pd-main-image" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`aspect-square overflow-hidden border ${i === imgIdx ? "border-black" : "border-black/10 hover:border-black/40"}`} data-testid={`pd-thumb-${i}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <div className="font-mono-caps text-black/50 mb-2">{product.category} · {product.subcategory}</div>
          <h1 className="font-display text-4xl mb-4" data-testid="pd-name">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-8">
            <div className="text-2xl font-semibold" data-testid="pd-price">{money(product.price)}</div>
            {product.compare_at_price > product.price && (
              <div className="text-black/40 line-through">{money(product.compare_at_price)}</div>
            )}
          </div>
          <p className="text-black/70 leading-relaxed mb-8">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <div className="font-mono-caps text-black/50 mb-2">Size</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSelSize(s)} className={`border border-black min-w-[3rem] h-11 px-3 ${selSize === s ? "bg-black text-white" : "hover:bg-black hover:text-white"}`} data-testid={`pd-size-${s}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-6">
              <div className="font-mono-caps text-black/50 mb-2">Color · <span className="text-black">{selColor}</span></div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setSelColor(c)} className={`border border-black px-3 py-2 text-sm ${selColor === c ? "bg-black text-white" : "hover:bg-black hover:text-white"}`} data-testid={`pd-color-${c}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="font-mono-caps text-black/50 mb-2">Quantity</div>
            <div className="flex items-center border border-black w-fit">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-black hover:text-white" data-testid="pd-qty-dec"><Minus size={14} /></button>
              <span className="px-4 py-2 min-w-[3rem] text-center" data-testid="pd-qty">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-black hover:text-white" data-testid="pd-qty-inc"><Plus size={14} /></button>
            </div>
          </div>

          {err && <div className="text-[#D9381E] font-mono-caps mb-4" data-testid="pd-error">{err}</div>}

          <button onClick={handleAdd} className="w-full bg-black text-white py-4 font-mono-caps hover:bg-[#D9381E] flex items-center justify-center gap-2" data-testid="pd-add-btn">
            Add to bag <ArrowRight size={16} />
          </button>

          <div className="mt-8 border-t border-black/10 pt-6 space-y-3 text-sm text-black/60">
            <div>Free shipping on orders over $200</div>
            <div>Complimentary returns within 30 days</div>
            <div>Made responsibly in small runs</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-24">
          <h2 className="font-display text-3xl md:text-5xl mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/10">
            {related.map((p, i) => (
              <Link key={p.id} to={`/products/${p.id}`} className="group bg-white border border-black/10 hover:border-black" data-testid={`related-${p.id}`}>
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <div className="font-mono-caps text-black/50">{p.category}</div>
                  <div className="font-semibold text-sm mt-1">{p.name}</div>
                  <div className="text-sm">{money(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
