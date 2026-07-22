import React from "react";
import Marquee from "react-fast-marquee";

export default function TopMarquee() {
  return (
    <div className="bg-[#0A0A0A] text-white border-b border-black" data-testid="top-marquee">
      <Marquee gradient={false} speed={40} pauseOnHover>
        <div className="marquee-track font-mono-caps text-white/90">
          <span>Free worldwide shipping over $200</span>
          <span>•</span>
          <span>New drop — Winter Atelier'26</span>
          <span>•</span>
          <span>Handmade in Portugal, Italy & Japan</span>
          <span>•</span>
          <span>Complimentary returns within 30 days</span>
          <span>•</span>
        </div>
      </Marquee>
    </div>
  );
}
