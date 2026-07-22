import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { money, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
  name: "", description: "", price: 100, compare_at_price: 0,
  category: "Tops", subcategory: "",
  sizes: "", colors: "", images: "",
  stock: 50, featured: false,
};

export default function AdminPage() {
  const { user, ready } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const loadProducts = () => api.get("/products", { params: { limit: 200 } }).then((r) => setProducts(r.data));
  const loadOrders = () => api.get("/orders/all").then((r) => setOrders(r.data));

  useEffect(() => {
    if (user && user.role === "admin") { loadProducts(); loadOrders(); }
  }, [user]);

  if (ready && (user === false || user?.role !== "admin")) return <Navigate to="/login?next=/admin" replace />;
  if (!user || user === null) return null;

  const openNew = () => { setEditing("new"); setForm(EMPTY); setErr(""); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "", price: p.price,
      compare_at_price: p.compare_at_price || 0, category: p.category,
      subcategory: p.subcategory || "",
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      images: (p.images || []).join("\n"),
      stock: p.stock ?? 0, featured: !!p.featured,
    });
    setErr("");
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    const payload = {
      name: form.name.trim(),
      description: form.description,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      category: form.category.trim(),
      subcategory: form.subcategory.trim() || null,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock),
      featured: !!form.featured,
    };
    try {
      if (editing === "new") await api.post("/products", payload);
      else await api.put(`/products/${editing.id}`, payload);
      await loadProducts();
      setEditing(null);
      toast.success(editing === "new" ? "Product created" : "Product updated");
    } catch (e) {
      setErr(formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await api.delete(`/products/${p.id}`);
    await loadProducts();
    toast.success("Deleted");
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-12" data-testid="admin-page">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <div className="font-mono-caps text-[#D9381E] mb-2">Admin</div>
          <h1 className="font-display text-5xl md:text-6xl">Studio Console</h1>
        </div>
        <button onClick={openNew} className="bg-black text-white px-6 py-3 font-mono-caps hover:bg-[#D9381E] inline-flex items-center gap-2" data-testid="admin-new-product-btn">
          <Plus size={16} /> New product
        </button>
      </div>

      <div className="border-y border-black flex gap-6 py-3 mb-6 font-mono-caps">
        <button onClick={() => setTab("products")} className={tab === "products" ? "text-black" : "text-black/40 hover:text-black"} data-testid="admin-tab-products">Products ({products.length})</button>
        <button onClick={() => setTab("orders")} className={tab === "orders" ? "text-black" : "text-black/40 hover:text-black"} data-testid="admin-tab-orders">Orders ({orders.length})</button>
      </div>

      {tab === "products" && (
        <div className="border border-black overflow-x-auto" data-testid="admin-products-table">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] border-b border-black font-mono-caps text-left">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-black/10" data-testid={`admin-row-${p.id}`}>
                  <td className="p-3"><img src={p.images?.[0]} alt="" className="w-12 h-16 object-cover" /></td>
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{money(p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.featured ? "★" : "—"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 border border-black hover:bg-black hover:text-white" data-testid={`admin-edit-${p.id}`}><Pencil size={14} /></button>
                      <button onClick={() => del(p)} className="p-2 border border-black hover:bg-[#D9381E] hover:text-white hover:border-[#D9381E]" data-testid={`admin-delete-${p.id}`}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "orders" && (
        <div className="border border-black" data-testid="admin-orders">
          {orders.length === 0 ? (
            <div className="p-8 text-black/50">No orders yet.</div>
          ) : orders.map((o) => (
            <div key={o.id} className="border-b border-black/10 p-4 grid md:grid-cols-5 gap-3 text-sm">
              <div className="font-mono-caps"><div className="text-black/50">Order</div>N° {o.id.slice(0, 8).toUpperCase()}</div>
              <div className="font-mono-caps"><div className="text-black/50">Customer</div>{o.user_email}</div>
              <div className="font-mono-caps"><div className="text-black/50">Items</div>{o.items.reduce((a, i) => a + i.quantity, 0)}</div>
              <div className="font-mono-caps"><div className="text-black/50">Placed</div>{new Date(o.created_at).toLocaleString()}</div>
              <div className="font-mono-caps text-right"><div className="text-black/50">Total</div><span className="text-lg">{money(o.total)}</span></div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white border border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="admin-product-form">
            <div className="flex justify-between items-center p-5 border-b border-black">
              <h2 className="font-display text-2xl">{editing === "new" ? "New product" : `Edit — ${editing.name}`}</h2>
              <button onClick={() => setEditing(null)}><X /></button>
            </div>
            <form onSubmit={submitProduct} className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" data-testid="admin-form-name" /></Field>
                <Field label="Category"><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" data-testid="admin-form-category" /></Field>
                <Field label="Subcategory"><input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" /></Field>
                <Field label="Price (USD)"><input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" data-testid="admin-form-price" /></Field>
                <Field label="Compare price (optional)"><input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" /></Field>
                <Field label="Stock"><input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" /></Field>
                <Field label="Sizes (comma separated)"><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="XS, S, M, L, XL" className="w-full border border-black px-3 py-2 outline-none" /></Field>
                <Field label="Colors (comma separated)"><input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Black, Ivory" className="w-full border border-black px-3 py-2 outline-none" /></Field>
              </div>
              <Field label="Image URLs (one per line)">
                <textarea rows={3} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full border border-black px-3 py-2 outline-none font-mono text-xs" data-testid="admin-form-images" />
              </Field>
              <Field label="Description">
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-black px-3 py-2 outline-none" />
              </Field>
              <label className="flex items-center gap-2 font-mono-caps text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} data-testid="admin-form-featured" /> Featured
              </label>
              {err && <div className="text-[#D9381E] font-mono-caps text-sm" data-testid="admin-form-error">{err}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="border border-black px-5 py-2 font-mono-caps hover:bg-black hover:text-white">Cancel</button>
                <button disabled={saving} className="bg-[#D9381E] text-white px-6 py-2 font-mono-caps hover:bg-black disabled:opacity-50" data-testid="admin-form-save">{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <div className="font-mono-caps text-black/50 mb-1 text-xs">{label}</div>
    {children}
  </label>
);
