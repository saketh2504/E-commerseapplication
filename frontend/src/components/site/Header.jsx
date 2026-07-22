import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/shop", label: "Shop All" },
  { to: "/shop?category=Outerwear", label: "Outerwear" },
  { to: "/shop?category=Tops", label: "Tops" },
  { to: "/shop?category=Bottoms", label: "Bottoms" },
  { to: "/shop?category=Dresses", label: "Dresses" },
  { to: "/shop?category=Accessories", label: "Accessories" },
];

export default function Header() {
  const { cart, setOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black" data-testid="site-header">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="font-display text-2xl md:text-3xl" data-testid="logo-link">
            ATELIER<span className="text-[#D9381E]">44</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-mono-caps">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-black hover:text-[#D9381E]"
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <form onSubmit={submitSearch} className="hidden md:flex items-center border border-black" data-testid="header-search-form">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="w-40 lg:w-56 px-3 py-2 text-sm outline-none bg-white"
                data-testid="header-search-input"
              />
              <button type="submit" className="px-3 py-2 border-l border-black hover:bg-black hover:text-white" data-testid="header-search-btn">
                <Search size={14} />
              </button>
            </form>

            {user && user !== false ? (
              <div className="hidden md:flex items-center gap-3 font-mono-caps">
                <Link to="/account" className="hover:text-[#D9381E]" data-testid="header-account-link">
                  {user.name.split(" ")[0]}
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="text-[#D9381E]" data-testid="header-admin-link">Admin</Link>
                )}
                <button onClick={logout} className="hover:text-[#D9381E]" data-testid="header-logout-btn">Sign out</button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex items-center gap-1 font-mono-caps hover:text-[#D9381E]" data-testid="header-login-link">
                <User size={16} /> Sign in
              </Link>
            )}

            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-2 border border-black px-3 py-2 hover:bg-black hover:text-white"
              data-testid="header-cart-btn"
            >
              <ShoppingBag size={16} />
              <span className="font-mono-caps">Bag</span>
              <span className="font-mono-caps" data-testid="header-cart-count">({cart.count})</span>
            </button>

            <button className="lg:hidden p-2" onClick={() => setMobile((v) => !v)} data-testid="mobile-menu-btn" aria-label="menu">
              {mobile ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobile && (
          <div className="lg:hidden border-t border-black py-4 space-y-3" data-testid="mobile-menu">
            <form onSubmit={submitSearch} className="flex border border-black">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="flex-1 px-3 py-2 text-sm outline-none"
                data-testid="mobile-search-input"
              />
              <button type="submit" className="px-3 py-2 border-l border-black">
                <Search size={14} />
              </button>
            </form>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobile(false)} className="block font-mono-caps py-1" data-testid={`mnav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {n.label}
              </Link>
            ))}
            {user && user !== false ? (
              <>
                <Link to="/account" onClick={() => setMobile(false)} className="block font-mono-caps py-1">Account</Link>
                {user.role === "admin" && <Link to="/admin" onClick={() => setMobile(false)} className="block font-mono-caps py-1 text-[#D9381E]">Admin</Link>}
                <button onClick={() => { logout(); setMobile(false); }} className="block font-mono-caps py-1">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobile(false)} className="block font-mono-caps py-1">Sign in</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
