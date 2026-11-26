import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#123B2B",
          dark: "#0B241A",
          light: "#1A523D",
        },
        emerald: {
          DEFAULT: "#15803D",
          dark: "#166534",
          light: "#22C55E",
        },
        mint: {
          DEFAULT: "#DCFCE7",
          light: "#F0FDF4",
          dark: "#BBF7D0",
        },
        cream: {
          DEFAULT: "#F7F8F2",
          dark: "#EFEFE8",
        },
        charcoal: {
          DEFAULT: "#17241C",
          muted: "#64748B",
        },
        amber: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
        },
        crimson: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["var(--font-heading)", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(18, 59, 43, 0.05), 0 1px 2px -1px rgba(18, 59, 43, 0.05)",
        card: "0 4px 6px -1px rgba(18, 59, 43, 0.07), 0 2px 4px -2px rgba(18, 59, 43, 0.05)",
        elevation: "0 10px 15px -3px rgba(18, 59, 43, 0.08), 0 4px 6px -4px rgba(18, 59, 43, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
