import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Tema nexosgen-nexosfinn.
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
        active: {
          DEFAULT: "hsl(var(--active) / <alpha-value>)",
          foreground: "hsl(var(--active-foreground) / <alpha-value>)",
        },
        // Chip do item de navegação ativo no tema claro; ver globals.css.
        "nav-active": "hsl(var(--nav-active) / <alpha-value>)",
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
        warning: "hsl(var(--warning) / <alpha-value>)",
        "surface-hover": "hsl(var(--surface-hover) / <alpha-value>)",
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
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        // Só para palavras de destaque em títulos; ver .font-display.
        serif: ["var(--font-serif)", "Georgia", "serif"],
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
        // Flutuação lenta da prévia do produto no hero.
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        // Halo de luz que "respira" atrás da interface.
        breathe: {
          "0%, 100%": { opacity: "0.75", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        // Entrada do hero: curta, para não atrasar a primeira pintura.
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "rise-in": "rise-in 400ms var(--ease-out-expo) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "draw-line": "draw-line 1.6s var(--ease-out-expo) forwards",
        float: "float 7s ease-in-out infinite",
        breathe: "breathe 8s ease-in-out infinite",
        "fade-up": "fade-up 700ms var(--ease-out-expo) both",
      },
    },
  },
  plugins: [animate],
};

export default config;
