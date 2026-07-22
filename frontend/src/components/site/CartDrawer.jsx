import React from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { money } from "@/lib/api";

export default function CartDrawer() {
  const { cart, open, setOpen, update, remove } = useCart();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} data-testid="cart-overlay" />}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white z-50 border-l border-black transform ${open ? "translate-x-0" : "translate-x-full"} transition-transform duration-200 flex flex-col`}
        data-testid="cart-drawer"
      >
        <div className="flex items-center justify-between p-5 border-b border-black">
          <div className="font-display text-2xl">Your Bag <span className="text-black/40">({cart.count})</span></div>
          <button onClick={() => setOpen(false)} className="p-1 hover:text-[#D9381E]" data-testid="cart-close-btn"><X size={22} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="p-10 text-center">
              <div className="font-mono-caps text-black/50 mb-6">Your bag is empty</div>
              <Link to="/shop" onClick={() => setOpen(false)} className="inline-block border border-black px-6 py-3 font-mono-caps hover:bg-black hover:text-white" data-testid="cart-empty-shop-btn">
                Browse the collection
              </Link>
            </div>
          ) : (
            cart.items.map((it) => (
              <div key={it.id} className="flex gap-4 p-5 border-b border-black/10" data-testid={`cart-item-${it.id}`}>
                <img src={it.product.images?.[0]} alt={it.product.name} className="w-24 h-32 object-cover grayscale-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${it.product.id}`} onClick={() => setOpen(false)} className="font-semibold hover:text-[#D9381E] line-clamp-2">{it.product.name}</Link>
                  <div className="font-mono-caps text-black/50 mt-1">
                    {it.size && `Size ${it.size}`} {it.color && ` • ${it.color}`}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-black">
                      <button onClick={() => update(it.id, Math.max(1, it.quantity - 1))} className="px-2 py-1 hover:bg-black hover:text-white" data-testid={`cart-decrease-${it.id}`}><Minus size={12} /></button>
                      <span className="px-3 text-sm" data-testid={`cart-qty-${it.id}`}>{it.quantity}</span>
                      <button onClick={() => update(it.id, it.quantity + 1)} className="px-2 py-1 hover:bg-black hover:text-white" data-testid={`cart-increase-${it.id}`}><Plus size={12} /></button>
                    </div>
                    <div className="font-semibold">{money(it.line_total)}</div>
                  </div>
                </div>
                <button onClick={() => remove(it.id)} className="text-black/50 hover:text-[#D9381E] self-start" data-testid={`cart-remove-${it.id}`}><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="border-t border-black p-5 space-y-3">
            <div className="flex justify-between font-mono-caps">
              <span>Subtotal</span>
              <span data-testid="cart-subtotal">{money(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between font-mono-caps text-black/60">
              <span>Shipping</span>
              <span>{cart.shipping === 0 ? "Free" : money(cart.shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span data-testid="cart-total">{money(cart.total)}</span>
            </div>
            <Link to="/checkout" onClick={() => setOpen(false)} className="block text-center bg-[#D9381E] text-white py-4 font-mono-caps hover:bg-black" data-testid="cart-checkout-btn">
              Proceed to checkout
            </Link>
            <Link to="/cart" onClick={() => setOpen(false)} className="block text-center border border-black py-3 font-mono-caps hover:bg-black hover:text-white" data-testid="cart-view-btn">
              View full bag
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
