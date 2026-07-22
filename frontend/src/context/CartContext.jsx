import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const CartContext = createContext(null);

const EMPTY = { items: [], subtotal: 0, shipping: 0, total: 0, count: 0 };

export function CartProvider({ children }) {
  const { user, ready } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user || user === false) {
      setCart(EMPTY);
      return;
    }
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch {
      setCart(EMPTY);
    }
  }, [user]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const add = async ({ product_id, size, color, quantity = 1 }) => {
    if (!user) {
      toast("Please sign in to add items.", { description: "Your bag is stored to your account." });
      return { ok: false, needsAuth: true };
    }
    try {
      const { data } = await api.post("/cart", { product_id, size, color, quantity });
      setCart(data);
      setOpen(true);
      toast.success("Added to bag");
      return { ok: true };
    } catch (e) {
      toast.error("Could not add to bag");
      return { ok: false };
    }
  };

  const update = async (item_id, quantity) => {
    const { data } = await api.put(`/cart/${item_id}`, { quantity });
    setCart(data);
  };

  const remove = async (item_id) => {
    const { data } = await api.delete(`/cart/${item_id}`);
    setCart(data);
  };

  const clear = async () => {
    const { data } = await api.delete(`/cart`);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, add, update, remove, clear, open, setOpen, reload: load }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
