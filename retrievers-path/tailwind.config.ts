import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--rp-bg)",
        surface: { DEFAULT: "var(--rp-surface)", 2: "var(--rp-surface-2)" },
        line: "var(--rp-line)",
        ink: { DEFAULT: "var(--rp-ink)", 2: "var(--rp-ink-2)", 3: "var(--rp-ink-3)" },
        gold: { DEFAULT: "var(--rp-gold)", soft: "var(--rp-gold-soft)", tint: "var(--rp-gold-tint)", deep: "var(--rp-gold-deep)" },
        teal: { DEFAULT: "var(--rp-teal)", tint: "var(--rp-teal-tint)" },
        mint: { DEFAULT: "var(--rp-mint)", tint: "var(--rp-mint-tint)" },
        coral: { DEFAULT: "var(--rp-coral)", tint: "var(--rp-coral-tint)" },
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        dys: ["var(--font-atkinson)", "sans-serif"],
      },
      borderRadius: { xl: "16px", "2xl": "20px" },
      boxShadow: { card: "0 1px 2px rgba(28,27,25,.05), 0 8px 24px rgba(28,27,25,.06)" },
    },
  },
} satisfies Config;
