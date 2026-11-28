import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FoodRelay Studio Signature Palette
        studio: {
          obsidian: "#141417",
          porcelain: "#FAF9F6",
          tangerine: "#FF7849",
          "tangerine-hover": "#F06635",
          "tangerine-light": "#FFF0EB",
          indigo: "#635BFF",
          "indigo-hover": "#5046E5",
          "indigo-light": "#EAE7FF",
          jade: "#16856B",
          "jade-light": "#E6F5F0",
          graphite: "#242428",
          sand: "#EFEBE4",
          lavender: "#EAE7FF",
          silver: "#A1A1AA",
          charcoal: "#1A1A1E",
          surface: "var(--studio-surface)",
          "surface-elevated": "var(--studio-surface-elevated)",
          border: "var(--studio-border)",
          "border-subtle": "var(--studio-border-subtle)",
          text: "var(--studio-text-primary)",
          "text-secondary": "var(--studio-text-secondary)",
          "text-muted": "var(--studio-text-muted)",
        },

        // Semantic CSS variable mappings
        canvas: {
          DEFAULT: "var(--bg-canvas)",
          subtle: "var(--bg-canvas-subtle)",
        },
        panel: {
          DEFAULT: "var(--bg-panel)",
          elevated: "var(--bg-panel-elevated)",
          muted: "var(--bg-panel-muted)",
        },

        // Backward compatibility mappings (keeps existing tests & components robust)
        midnight: {
          DEFAULT: "#141417",
          light: "#242428",
          dark: "#0E0E10",
        },
        apricot: {
          DEFAULT: "#FF7849", // Mapped to Tangerine
          light: "#FFF0EB",
          dark: "#E05D2D",
          glow: "#FFE5DC",
        },
        violet: {
          DEFAULT: "#635BFF", // Mapped to Electric Indigo
          light: "#7B75FF",
          dark: "#4B43E0",
          soft: "#EAE7FF",
        },
        teal: {
          DEFAULT: "#16856B", // Mapped to Jade
          light: "#1EA484",
          dark: "#0F634F",
          subtle: "#E6F5F0",
        },
        coral: {
          DEFAULT: "#FF4D4D",
          light: "#FF8080",
          dark: "#D93636",
          subtle: "#FFEBEB",
        },
        forest: {
          DEFAULT: "#141417",
          dark: "#0E0E10",
          light: "#242428",
        },
        emerald: {
          DEFAULT: "#16856B",
          dark: "#0F634F",
          light: "#1EA484",
        },
        mint: {
          DEFAULT: "#EAE7FF",
          light: "#FAF9F6",
          dark: "#635BFF",
        },
        cream: {
          DEFAULT: "#FAF9F6",
          dark: "#EFEBE4",
        },
        charcoal: {
          DEFAULT: "#141417",
          muted: "#71717A",
        },
        amber: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        crimson: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Geist Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.9375rem" }], // 11px
        xs: ["0.75rem", { lineHeight: "1.0625rem" }],      // 12px
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],      // 13px
        base: ["0.875rem", { lineHeight: "1.375rem" }],    // 14px
        lg: ["1rem", { lineHeight: "1.5rem" }],
        xl: ["1.125rem", { lineHeight: "1.625rem" }],
        "2xl": ["1.375rem", { lineHeight: "1.875rem" }],
        "3xl": ["1.75rem", { lineHeight: "2.125rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        elevation: "0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 16px -2px rgba(255, 120, 73, 0.25)",
        indigoglow: "0 0 16px -2px rgba(99, 91, 255, 0.25)",
      },
      borderRadius: {
        studio: "8px",
        "studio-md": "12px",
        "studio-lg": "16px",
      },
    },
  },
  plugins: [],
};

export default config;
