import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { money } from "@/lib/api";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, update, remove } = useCart();

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12" data-testid="cart-page">
      <h1 className="font-display text-5xl md:text-7xl mb-10">Your Bag</h1>

      {cart.items.length === 0 ? (
        <div className="border border-black p-16 text-center">
          <div className="font-display text-3xl mb-4">Your bag is quiet.</div>
          <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 font-mono-caps hover:bg-[#D9381E]" data-testid="cart-page-shop-btn">Discover the collection</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 border border-black">
            {cart.items.map((it) => (
              <div key={it.id} className="grid grid-cols-[100px_1fr_auto] md:grid-cols-[140px_1fr_auto_auto] gap-4 md:gap-6 p-4 md:p-6 border-b border-black/10 last:border-b-0" data-testid={`cart-row-${it.id}`}>
                <img src={it.product.images?.[0]} alt={it.product.name} className="w-full aspect-[3/4] object-cover" />
                <div>
                  <Link to={`/products/${it.product.id}`} className="font-semibold hover:text-[#D9381E]">{it.product.name}</Link>
                  <div className="font-mono-caps text-black/50 mt-1">{it.product.category}</div>
                  <div className="mt-2 text-sm text-black/70">
                    {it.size && <>Size {it.size}</>}{it.color && <> · {it.color}</>}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="font-semibold">{money(it.line_total)}</div>
                  <div className="flex items-center border border-black">
                    <button onClick={() => update(it.id, Math.max(1, it.quantity - 1))} className="px-2 py-1 hover:bg-black hover:text-white"><Minus size={12} /></button>
                    <span className="px-3 text-sm">{it.quantity}</span>
                    <button onClick={() => update(it.id, it.quantity + 1)} className="px-2 py-1 hover:bg-black hover:text-white"><Plus size={12} /></button>
                  </div>
                </div>
                <button onClick={() => remove(it.id)} className="text-black/40 hover:text-[#D9381E] col-span-3 md:col-span-1 md:self-start justify-self-end" data-testid={`cart-page-remove-${it.id}`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="border border-black p-6 space-y-3 sticky top-28">
              <h2 className="font-display text-2xl mb-4">Order summary</h2>
              <div className="flex justify-between font-mono-caps">
                <span>Subtotal</span><span>{money(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between font-mono-caps text-black/60">
                <span>Shipping</span><span>{cart.shipping === 0 ? "Free" : money(cart.shipping)}</span>
              </div>
              <div className="border-t border-black/20 pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span><span data-testid="cart-page-total">{money(cart.total)}</span>
              </div>
              <Link to="/checkout" className="mt-4 block text-center bg-[#D9381E] text-white py-4 font-mono-caps hover:bg-black" data-testid="cart-page-checkout-btn">Checkout</Link>
              <Link to="/shop" className="block text-center border border-black py-3 font-mono-caps hover:bg-black hover:text-white">Continue shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
