import type { Config } from "tailwindcss";

/**
 * Tema nexosgen-financehub.
 *
 * Este arquivo apenas expõe, como utilitários, as variáveis definidas em
 * globals.css. Cor, raio e sombra novos entram lá — nunca hardcoded em
 * componente.
 *
 * Todas as cores usam `hsl(var(--token) / <alpha-value>)` para que os
 * modificadores de opacidade (`bg-primary/10`, `border-border/60`) continuem
 * funcionando.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        // Semântica financeira: entrada e saída de dinheiro.
        positive: "hsl(var(--positive) / <alpha-value>)",
        negative: "hsl(var(--negative) / <alpha-value>)",
        // Painel escuro de marca (tela de acesso e navegação).
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
      },
      borderRadius: {
        // Os utilitários herdados do Tailwind também passam a responder aos
        // tokens, para que a linguagem de forma valha em toda a interface sem
        // reescrever cada componente.
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-sm)",
        "2xl": "var(--radius-md)",
        "3xl": "var(--radius-lg)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        "out-expo": "var(--ease-out-expo)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Entrada padrão ao rolar: sobe e aparece.
        "rise-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.82)" },
        },
        "draw-line": {
          from: { strokeDashoffset: "1200" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "rise-in": "rise-in 400ms var(--ease-out-expo) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "draw-line": "draw-line 1.6s var(--ease-out-expo) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
