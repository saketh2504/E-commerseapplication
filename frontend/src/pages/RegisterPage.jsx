import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (user && user !== false) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await register(form.name, form.email, form.password);
    setBusy(false);
    if (r.ok) nav("/");
    else setErr(r.error);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2" data-testid="register-page">
      <div className="p-8 md:p-16 flex items-center">
        <div className="w-full max-w-md">
          <div className="font-mono-caps text-black/50 mb-2">Create account</div>
          <h1 className="font-display text-5xl mb-8">Join the atelier</h1>
          <form onSubmit={submit} className="space-y-5" data-testid="register-form">
            <label className="block">
              <div className="font-mono-caps text-black/50 mb-1">Full name</div>
              <input value={form.name} onChange={set("name")} required className="w-full border border-black px-3 py-3 outline-none focus:ring-2 focus:ring-black" data-testid="register-name" />
            </label>
            <label className="block">
              <div className="font-mono-caps text-black/50 mb-1">Email</div>
              <input type="email" value={form.email} onChange={set("email")} required className="w-full border border-black px-3 py-3 outline-none focus:ring-2 focus:ring-black" data-testid="register-email" />
            </label>
            <label className="block">
              <div className="font-mono-caps text-black/50 mb-1">Password (min 6 chars)</div>
              <input type="password" value={form.password} onChange={set("password")} required minLength={6} className="w-full border border-black px-3 py-3 outline-none focus:ring-2 focus:ring-black" data-testid="register-password" />
            </label>
            {err && <div className="text-[#D9381E] font-mono-caps text-sm" data-testid="register-error">{err}</div>}
            <button disabled={busy} className="w-full bg-black text-white py-4 font-mono-caps hover:bg-[#D9381E] disabled:opacity-50" data-testid="register-submit">
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
          <div className="mt-6 text-sm text-black/60">
            Already have an account? <Link to="/login" className="underline hover:text-[#D9381E]">Sign in</Link>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative">
        <img src="https://images.pexels.com/photos/9121191/pexels-photo-9121191.jpeg" alt="" className="w-full h-full object-cover" />
        <div className="absolute bottom-8 left-8 text-white font-display text-4xl leading-none">Build<br />your<br />archive.</div>
      </div>
    </div>
  );
}
