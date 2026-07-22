import React, { useState } from "react";
import { Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (user && user !== false) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await login(email, password);
    setBusy(false);
    if (r.ok) nav(next);
    else setErr(r.error);
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2" data-testid="login-page">
      <div className="hidden lg:block relative">
        <img src="https://images.pexels.com/photos/9594668/pexels-photo-9594668.jpeg" alt="" className="w-full h-full object-cover" />
        <div className="absolute bottom-8 left-8 text-white font-display text-4xl leading-none">Return<br />to the<br />atelier.</div>
      </div>
      <div className="p-8 md:p-16 flex items-center">
        <div className="w-full max-w-md">
          <div className="font-mono-caps text-black/50 mb-2">Sign in</div>
          <h1 className="font-display text-5xl mb-8">Welcome back</h1>

          <form onSubmit={submit} className="space-y-5" data-testid="login-form">
            <label className="block">
              <div className="font-mono-caps text-black/50 mb-1">Email</div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-black px-3 py-3 outline-none focus:ring-2 focus:ring-black" data-testid="login-email" />
            </label>
            <label className="block">
              <div className="font-mono-caps text-black/50 mb-1">Password</div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border border-black px-3 py-3 outline-none focus:ring-2 focus:ring-black" data-testid="login-password" />
            </label>
            <div className="flex justify-end mt-2">
  <Link
    to="/forgot-password"
    className="text-sm text-[#D9381E] hover:underline"
  >
    Forgot Password?
  </Link>
</div>
            {err && <div className="text-[#D9381E] font-mono-caps text-sm" data-testid="login-error">{err}</div>}
            <button type="submit" disabled={busy} className="w-full bg-black text-white py-4 font-mono-caps hover:bg-[#D9381E] disabled:opacity-50" data-testid="login-submit">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-sm text-black/60">
            No account yet? <Link to="/register" className="underline hover:text-[#D9381E]" data-testid="login-register-link">Create one</Link>
          </div>
          <div className="mt-6 border border-black/10 p-4 text-xs text-black/60">
            <div className="font-mono-caps mb-1 text-black/80">Admin demo</div>
            admin@atelier.com / Admin@1234
          </div>
        </div>
      </div>
    </div>
  );
}
