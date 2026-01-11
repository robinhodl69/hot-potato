/**
 * The Arbitrum Core - Design System (Atomic Design)
 * 
 * Style: "Stellar Core Command"
 * Deep space control interface with thermal reactor aesthetics
 */
import { type Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ========================
      // DESIGN TOKENS - ATOMS
      // ========================
      colors: {
        // Background
        bg: {
          primary: "#050505",
          secondary: "#0a0a0a",
          tertiary: "#111111",
        },
        // State: Stable (Cyan)
        stable: {
          DEFAULT: "#00ffff",
          light: "#66ffff",
          dark: "#00cccc",
          glow: "rgba(0, 255, 255, 0.3)",
        },
        // State: Meltdown (Red/Orange)
        meltdown: {
          DEFAULT: "#ff2200",
          light: "#ff4422",
          dark: "#cc1a00",
          glow: "rgba(255, 50, 0, 0.4)",
        },
        // Neutrals
        neutral: {
          50: "#f0f0f0",
          100: "#e0e0e0",
          200: "#c0c0c0",
          300: "#a0a0a0",
          400: "#888888",
          500: "#666666",
          600: "#444444",
          700: "#333333",
          800: "#222222",
          900: "#111111",
        },
        // Semantic
        success: "#22c55e",
        warning: "#facc15",
        error: "#ef4444",
      },

      // Typography
      fontFamily: {
        heading: ["Orbitron", "sans-serif"],
        data: ["Rajdhani", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      fontSize: {
        "display-1": ["4rem", { lineHeight: "1.1", letterSpacing: "0.5em" }],
        "display-2": ["2.5rem", { lineHeight: "1.2", letterSpacing: "0.4em" }],
        "heading-1": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0.3em" }],
        "heading-2": ["1.25rem", { lineHeight: "1.4", letterSpacing: "0.2em" }],
        "body-lg": ["1rem", { lineHeight: "1.5" }],
        "body": ["0.875rem", { lineHeight: "1.5" }],
        "caption": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.1em" }],
        "micro": ["0.625rem", { lineHeight: "1.3", letterSpacing: "0.15em" }],
      },

      // Spacing (8px base grid)
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },

      // Border Radius
      borderRadius: {
        "sm": "2px",
        "DEFAULT": "4px",
        "lg": "8px",
        "xl": "12px",
      },

      // Box Shadow (Glow Effects)
      boxShadow: {
        "glow-stable": "0 0 30px rgba(0, 255, 255, 0.3)",
        "glow-stable-lg": "0 0 60px rgba(0, 255, 255, 0.4)",
        "glow-meltdown": "0 0 30px rgba(255, 50, 0, 0.4)",
        "glow-meltdown-lg": "0 0 60px rgba(255, 50, 0, 0.5)",
        "glass": "inset 0 0 30px rgba(255, 255, 255, 0.02)",
      },

      // Backdrop Blur
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        lg: "20px",
        xl: "30px",
      },

      // Animation
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse": "spin 15s linear infinite reverse",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "neon-flicker": "neon-flicker 3s infinite alternate",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.8" },
          "94%": { opacity: "1" },
          "95%": { opacity: "0.9" },
          "96%": { opacity: "1" },
        },
      },

      // Z-Index Scale
      zIndex: {
        "background": "-10",
        "base": "0",
        "content": "10",
        "overlay": "20",
        "modal": "30",
        "nav": "40",
        "toast": "50",
      },
    },
  },
  plugins: [],
};

export default config;