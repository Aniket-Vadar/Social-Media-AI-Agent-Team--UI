import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FAFAFB",
        surface: "#FFFFFF",
        border: "#E9ECF2",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        textMuted: "#9CA3AF",
        brand: {
          50: "#EEF0FD",
          100: "#DDDFFB",
          200: "#BCBFF8",
          300: "#9C9FF4",
          400: "#7C80F1",
          500: "#6D5EF5",
          600: "#5848E5",
          700: "#4534CF",
          800: "#3423A7",
          900: "#24157A",
          DEFAULT: "#6D5EF5",
        },
        agent: {
          master: "#6D5EF5",
          researcher: "#0EA5E9",
          creator: "#F59E0B",
          scheduler: "#10B981",
          analytics: "#EC4899",
        },
        status: {
          draft: "#6B7280",
          pending: "#F59E0B",
          scheduled: "#3B82F6",
          published: "#10B981",
          failed: "#EF4444",
        },
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        card: "0 4px 20px -2px rgba(16, 24, 40, 0.05), 0 2px 6px -1px rgba(16, 24, 40, 0.03)",
        elevated: "0 12px 32px -4px rgba(16, 24, 40, 0.08), 0 4px 12px -2px rgba(16, 24, 40, 0.04)",
        brand: "0 8px 24px -4px rgba(109, 94, 245, 0.35)",
        glow: "0 0 20px rgba(109, 94, 245, 0.25)",
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
