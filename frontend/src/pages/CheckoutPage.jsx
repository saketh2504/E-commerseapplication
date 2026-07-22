import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api, { money, formatApiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2 } from "lucide-react";

const FIELDS = [
  ["full_name", "Full name"],
  ["line1", "Address line 1"],
  ["line2", "Address line 2 (optional)"],
  ["city", "City"],
  ["state", "State / Region"],
  ["postal_code", "Postal code"],
  ["country", "Country"],
  ["phone", "Phone"],
];

export default function CheckoutPage() {
  const { cart, reload } = useCart();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", line1: "", line2: "", city: "", state: "", postal_code: "", country: "", phone: "" });
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  if (ready && user === false) return <Navigate to="/login?next=/checkout" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    for (const [k, l] of FIELDS) {
      if (k === "line2" || k === "state") continue;
      if (!form[k]?.trim()) return `${l} is required`;
    }
    return null;
  };

  const place = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    setErr("");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", { shipping_address: form });
      setOrder(data);
      await reload();
    } catch (er) {
      setErr(formatApiError(er));
    } finally {
      setPlacing(false);
    }
  };

  if (order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-24 text-center" data-testid="order-confirmation">
        <CheckCircle2 size={56} className="mx-auto text-[#2E4F2B] mb-6" />
        <div className="font-mono-caps text-black/50 mb-2">Confirmation N° {order.id.slice(0, 8).toUpperCase()}</div>
        <h1 className="font-display text-4xl md:text-6xl mb-4">Order placed.</h1>
        <p className="text-black/70 mb-8">A confirmation has been recorded to your account. Your pieces will be prepared by our atelier and shipped within 3–5 business days.</p>
        <div className="border border-black p-6 text-left mb-8">
          <div className="font-mono-caps text-black/50 mb-3">Summary</div>
          {order.items.map((i) => (
            <div key={i.product_id + (i.size || "") + (i.color || "")} className="flex justify-between py-1 text-sm">
              <span>{i.name} × {i.quantity} {i.size && `(${i.size})`}</span>
              <span>{money(i.line_total)}</span>
            </div>
          ))}
          <div className="border-t border-black/20 mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span><span>{money(order.total)}</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/account")} className="bg-black text-white px-6 py-3 font-mono-caps hover:bg-[#D9381E]" data-testid="order-view-orders-btn">View my orders</button>
          <button onClick={() => navigate("/shop")} className="border border-black px-6 py-3 font-mono-caps hover:bg-black hover:text-white">Keep shopping</button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-24 text-center">
        <h1 className="font-display text-4xl mb-4">Nothing to check out.</h1>
        <button onClick={() => navigate("/shop")} className="border border-black px-6 py-3 font-mono-caps hover:bg-black hover:text-white">Go to shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12" data-testid="checkout-page">
      <h1 className="font-display text-5xl md:text-7xl mb-10">Checkout</h1>
      <div className="grid lg:grid-cols-12 gap-8">
        <form onSubmit={place} className="lg:col-span-7 border border-black p-6 space-y-6" data-testid="checkout-form">
          <div>
            <div className="font-mono-caps text-black/50 mb-3">Shipping address</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {FIELDS.map(([k, l]) => (
                <label key={k} className={`text-sm ${k === "line1" || k === "line2" ? "sm:col-span-2" : ""}`}>
                  <div className="font-mono-caps text-black/50 mb-1">{l}</div>
                  <input value={form[k]} onChange={set(k)} className="w-full border border-black px-3 py-2 outline-none focus:ring-2 focus:ring-black" data-testid={`checkout-${k}`} />
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 pt-6">
            <div className="font-mono-caps text-black/50 mb-3">Payment</div>
            <div className="border border-dashed border-black/50 p-4 text-sm text-black/70">
              This is a <span className="font-semibold">demo checkout</span> — no real payment is processed. Placing the order will simulate a successful transaction.
            </div>
          </div>

          {err && <div className="text-[#D9381E] font-mono-caps" data-testid="checkout-error">{err}</div>}

          <button disabled={placing} className="w-full bg-[#D9381E] text-white py-4 font-mono-caps hover:bg-black disabled:opacity-50" data-testid="checkout-place-btn">
            {placing ? "Placing order…" : `Place order — ${money(cart.total)}`}
          </button>
        </form>

        <div className="lg:col-span-5">
          <div className="border border-black p-6 sticky top-28">
            <h2 className="font-display text-2xl mb-4">Bag</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {cart.items.map((i) => (
                <div key={i.id} className="flex gap-3 text-sm">
                  <img src={i.product.images?.[0]} alt={i.product.name} className="w-16 h-20 object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold line-clamp-2">{i.product.name}</div>
                    <div className="font-mono-caps text-black/50">Qty {i.quantity}{i.size && ` · ${i.size}`}</div>
                  </div>
                  <div className="font-semibold">{money(i.line_total)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-black/20 mt-4 pt-4 space-y-2">
              <div className="flex justify-between font-mono-caps"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
              <div className="flex justify-between font-mono-caps text-black/60"><span>Shipping</span><span>{cart.shipping === 0 ? "Free" : money(cart.shipping)}</span></div>
              <div className="flex justify-between text-lg font-semibold"><span>Total</span><span data-testid="checkout-total">{money(cart.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
