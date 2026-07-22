import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { money } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, ready, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user !== false) {
      api.get("/orders").then((r) => setOrders(r.data)).finally(() => setLoading(false));
    }
  }, [user]);

  if (ready && user === false) return <Navigate to="/login?next=/account" replace />;
  if (!user || user === null) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12" data-testid="account-page">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
        <div>
          <div className="font-mono-caps text-black/50 mb-2">Account</div>
          <h1 className="font-display text-5xl md:text-7xl">Hello, {user.name.split(" ")[0]}.</h1>
          <div className="text-black/60 mt-2">{user.email}</div>
        </div>
        <button onClick={logout} className="border border-black px-6 py-3 font-mono-caps hover:bg-black hover:text-white" data-testid="account-logout-btn">Sign out</button>
      </div>

      <div className="border-y border-black py-3 font-mono-caps text-black/50 mb-6">Order history</div>

      {loading ? (
        <div className="font-mono-caps text-black/50">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="border border-black p-12 text-center">
          <div className="font-display text-2xl mb-2">No orders yet.</div>
          <div className="text-black/60">Your future wardrobe waits.</div>
        </div>
      ) : (
        <div className="space-y-4" data-testid="account-orders">
          {orders.map((o) => (
            <div key={o.id} className="border border-black" data-testid={`order-${o.id}`}>
              <div className="flex flex-wrap justify-between gap-4 p-5 border-b border-black/10 bg-[#F9F9F9]">
                <div className="font-mono-caps">
                  <div className="text-black/50">Order</div>
                  <div>N° {o.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div className="font-mono-caps">
                  <div className="text-black/50">Placed</div>
                  <div>{new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <div className="font-mono-caps">
                  <div className="text-black/50">Status</div>
                  <div className="text-[#2E4F2B]">{o.status}</div>
                </div>
                <div className="font-mono-caps">
                  <div className="text-black/50">Total</div>
                  <div className="text-lg">{money(o.total)}</div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex gap-4 text-sm">
                    {i.image && <img src={i.image} alt={i.name} className="w-14 h-16 object-cover" />}
                    <div className="flex-1">
                      <div className="font-semibold">{i.name}</div>
                      <div className="font-mono-caps text-black/50">Qty {i.quantity}{i.size && ` · ${i.size}`}{i.color && ` · ${i.color}`}</div>
                    </div>
                    <div className="font-semibold">{money(i.line_total)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
