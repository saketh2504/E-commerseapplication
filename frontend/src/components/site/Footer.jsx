import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white mt-24" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-3xl mb-4">ATELIER<span className="text-[#D9381E]">44</span></div>
          <p className="text-white/60 text-sm leading-relaxed">
            An independent studio building rigorously constructed clothing for people who care about the details.
          </p>
        </div>
        <div>
          <div className="font-mono-caps mb-4 text-white/60">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop?category=Outerwear" className="hover:text-[#D9381E]">Outerwear</Link></li>
            <li><Link to="/shop?category=Tops" className="hover:text-[#D9381E]">Tops</Link></li>
            <li><Link to="/shop?category=Bottoms" className="hover:text-[#D9381E]">Bottoms</Link></li>
            <li><Link to="/shop?category=Dresses" className="hover:text-[#D9381E]">Dresses</Link></li>
            <li><Link to="/shop?category=Accessories" className="hover:text-[#D9381E]">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-mono-caps mb-4 text-white/60">Studio</div>
          <ul className="space-y-2 text-sm">
            <li>Ateliers in Porto & Milano</li>
            <li>Founded 2019</li>
            <li>Ethical Sourcing Report</li>
          </ul>
        </div>
        <div>
          <div className="font-mono-caps mb-4 text-white/60">Newsletter</div>
          <p className="text-white/60 text-sm mb-3">Inside access to drops & runway edits.</p>
          <div className="flex border border-white/60">
            <input placeholder="Email address" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" data-testid="footer-newsletter-input" />
            <button className="px-4 py-2 border-l border-white/60 font-mono-caps hover:bg-white hover:text-black" data-testid="footer-newsletter-btn">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row justify-between text-xs text-white/50">
          <div>© {new Date().getFullYear()} ATELIER 44. All rights reserved.</div>
          <div className="font-mono-caps">Terms • Privacy • Returns</div>
        </div>
      </div>
    </footer>
  );
}
