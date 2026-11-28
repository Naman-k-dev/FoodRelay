import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

/**
 * FoodRelay Studio Brandmark:
 * An original, minimalist geometric glyph:
 * Two interlocking dynamic forms representing the transfer of surplus sustenance
 * into dignity and hope.
 * Precision crafted with Tangerine (#FF7849) and Electric Indigo (#635BFF) on Obsidian/Graphite.
 */
export function Logo({ className = "", size = 28, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-md bg-studio-obsidian dark:bg-studio-graphite text-white flex-shrink-0 border border-studio-border overflow-hidden"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* First Relay Node: Source of Surplus (Electric Indigo) */}
          <path
            d="M6 16C6 10.4772 10.4772 6 16 6V16H6Z"
            fill="#635BFF"
          />
          {/* Second Relay Node: Destination of Sustenance (Tangerine) */}
          <path
            d="M26 16C26 21.5228 21.5228 26 16 26V16H26Z"
            fill="#FF7849"
          />
          {/* Dynamic Transfer Bridge Vector */}
          <circle cx="16" cy="16" r="2.5" fill="#FAF9F6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-heading font-bold text-sm tracking-tight text-studio-text">
              FoodRelay
            </span>
            <span className="text-[10px] font-mono font-medium text-studio-tangerine bg-studio-tangerine-light dark:bg-studio-tangerine/10 px-1 py-0.2 rounded border border-studio-tangerine/20">
              STUDIO
            </span>
          </div>
          <span className="text-[10px] tracking-wide text-studio-text-muted mt-0.5">
            Rescue food · Redirect hope
          </span>
        </div>
      )}
    </div>
  );
}
