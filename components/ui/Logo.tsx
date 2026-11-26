import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className = "", size = 32, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-forest text-mint shadow-subtle flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Bowl/Dish Base */}
          <path
            d="M8 22C8 28.6274 13.3726 34 20 34C26.6274 34 32 28.6274 32 22H8Z"
            fill="#15803D"
          />
          {/* Rescue Leaf / Sprout emerging upwards */}
          <path
            d="M20 7C14 7 12 14 16 19C18 21.5 22 21.5 24 19C28 14 26 7 20 7Z"
            fill="#DCFCE7"
          />
          {/* Relay / Connection Arrow Arc */}
          <path
            d="M13 14C11 17 11 21 13 23"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M27 14C29 17 29 21 27 23"
            stroke="#DCFCE7"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Steam / Vitality Sparkle */}
          <circle cx="20" cy="13" r="1.5" fill="#123B2B" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-bold text-lg leading-tight tracking-tight text-forest">
              FoodRelay
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-mint text-forest-dark border border-emerald/20">
              AI
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-wide text-charcoal-muted uppercase">
            Rescue food · Redirect hope
          </span>
        </div>
      )}
    </div>
  );
}
