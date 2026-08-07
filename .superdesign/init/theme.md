# Theme

## Compact token summary

- Primary brand: chartreuse lime `hsl(78 100% 62%)`; foreground nearly black.
- Accent: violet `hsl(252 96% 67%)`.
- Dark background/card: `hsl(0 0% 2%)` / `hsl(240 6% 7%)`; dark mode is the default visual identity.
- Light background/card: `hsl(240 20% 99%)` / white.
- Financial semantics: positive emerald, negative coral red.
- Typography: current variable Inter with system fallback; tabular numerals for money.
- Radius scale: 12px / 20px / 28px; rounded cards and controls.
- Shadows: restrained card elevation and chartreuse glow for primary CTAs.
- Motion: 150–400ms with exponential ease; rise-in, pulse-dot and draw-line.
- Breakpoints: Tailwind defaults; important responsive transitions at sm 640px and lg 1024px.

## Raw source dumps

## `frontend/tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

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

```

## `frontend/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/*
 * Design system NexosFinn — fonte única da verdade.
 *
 * Nenhum componente declara cor, raio ou sombra própria: tudo sai daqui, via
 * os utilitários do Tailwind mapeados em tailwind.config.ts. Trocar a
 * identidade do produto é trocar este arquivo.
 *
 * O tema escuro é a identidade primária (as referências da marca são escuras).
 * O claro é derivado dele, preservando a preferência do usuário.
 *
 * As cores estão em tripla HSL sem função, e não em hexadecimal, porque é esse
 * formato que permite ao Tailwind aplicar os modificadores de opacidade
 * (bg-primary/10, border-border/70) usados em toda a interface.
 */

@layer base {
  :root {
    color-scheme: light;

    /* --- Superfícies --- */
    --background: 240 20% 99%;
    --card: 0 0% 100%;
    --card-foreground: 240 6% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 6% 10%;

    /* --- Texto --- */
    --foreground: 240 6% 10%;
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 46%;
    --secondary: 240 5% 96%;
    --secondary-foreground: 240 6% 10%;

    /*
     * Verde-limão de assinatura (#C6FF3D). Usado só em CTA, no gráfico
     * principal e em um ou dois detalhes por seção — nunca em área grande.
     * O texto sobre ele é quase preto: limão com texto branco é ilegível.
     */
    --primary: 78 100% 62%;
    --primary-foreground: 240 10% 4%;

    /* Roxo secundário (#7C5CFC), para gradientes e destaques de apoio. */
    --accent: 252 96% 67%;
    --accent-foreground: 0 0% 100%;

    /* --- Semântica financeira --- */
    --positive: 158 64% 40%;
    --negative: 0 72% 51%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    /* --- Traços --- */
    --border: 240 6% 90%;
    --input: 240 6% 90%;
    --ring: 78 100% 45%;

    /* Painel de marca: escuro nos dois temas, é a assinatura da NexosFinn. */
    --sidebar: 0 0% 2%;
    --sidebar-foreground: 240 6% 64%;
    --sidebar-border: 0 0% 14%;

    /*
     * Gráficos.
     *
     * Aqui as variáveis guardam a cor completa, e não a tripla HSL, porque o
     * Recharts as injeta como atributo de apresentação do SVG — onde uma
     * tripla solta não seria interpretada.
     */
    --chart-grid: hsl(240 6% 90%);
    --chart-muted: hsl(240 4% 46%);
    --chart-cursor: hsl(240 5% 84%);
    --chart-hover: hsl(240 5% 96%);
    --chart-income: hsl(78 70% 40%);
    --chart-expense: hsl(0 72% 51%);
    --chart-accent: hsl(252 96% 67%);

    /* --- Forma --- */
    --radius-lg: 28px;
    --radius-md: 20px;
    --radius-sm: 12px;
    --radius: var(--radius-md);

    /* --- Profundidade --- */
    --shadow-card: 0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.1);
    --shadow-glow: 0 0 40px rgb(198 255 61 / 0.15);

    /* --- Movimento --- */
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dark {
    color-scheme: dark;

    /* --- Superfícies (#050505 / #111113 / #1a1a1d) --- */
    --background: 0 0% 2%;
    --card: 240 6% 7%;
    --card-foreground: 240 11% 96%;
    --popover: 240 6% 7%;
    --popover-foreground: 240 11% 96%;

    /* --- Texto (#f5f5f7 e sua versão a 60%) --- */
    --foreground: 240 11% 96%;
    --muted: 240 5% 11%;
    --muted-foreground: 240 6% 64%;
    --secondary: 240 5% 11%;
    --secondary-foreground: 240 11% 96%;

    --primary: 78 100% 62%;
    --primary-foreground: 240 10% 4%;

    --accent: 252 96% 67%;
    --accent-foreground: 0 0% 100%;

    /* #34D399 e #FF5C5C */
    --positive: 158 64% 52%;
    --negative: 0 100% 68%;
    --destructive: 0 100% 68%;
    --destructive-foreground: 240 10% 4%;

    /* Equivalente a branco a 8% sobre o fundo quase preto. */
    --border: 0 0% 14%;
    --input: 0 0% 16%;
    --ring: 78 100% 62%;

    --sidebar: 0 0% 2%;
    --sidebar-foreground: 240 6% 64%;
    --sidebar-border: 0 0% 14%;

    /* No escuro o limão aparece cheio: é o gráfico principal da marca. */
    --chart-grid: hsl(0 0% 14%);
    --chart-muted: hsl(240 6% 64%);
    --chart-cursor: hsl(0 0% 20%);
    --chart-hover: hsl(240 5% 11%);
    --chart-income: hsl(78 100% 62%);
    --chart-expense: hsl(0 100% 68%);
    --chart-accent: hsl(252 96% 67%);

    --shadow-card: 0 1px 2px rgb(0 0 0 / 0.4), 0 18px 48px -24px rgb(0 0 0 / 0.8);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  html,
  body {
    @apply bg-background text-foreground antialiased;
    min-height: 100%;
  }

  body {
    min-height: 100dvh;
    font-feature-settings: "cv11", "ss01";
  }

  /* Todo número financeiro alinha na vertical entre linhas de uma lista. */
  .tabular,
  [class*="tabular-nums"] {
    font-variant-numeric: tabular-nums;
  }
}

@layer components {
  /*
   * Cartão padrão: canto bem arredondado, borda de 1px quase invisível e
   * sombra discreta. É a única fonte de elevação da interface.
   */
  .surface {
    @apply rounded-2xl border border-border bg-card;
    box-shadow: var(--shadow-card);
  }

  /* Brilho do accent, reservado ao CTA principal e ao gráfico em destaque. */
  .glow {
    box-shadow: var(--shadow-glow);
  }
}

@layer utilities {
  /*
   * O fundo ocupa toda a tela no Safari; somente o conteúdo interativo é
   * afastado do recorte, do indicador de início e dos controles flutuantes.
   */
  .safe-area-page {
    padding-top: calc(1.25rem + env(safe-area-inset-top, 0px));
    padding-right: max(1rem, env(safe-area-inset-right, 0px));
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
    padding-left: max(1rem, env(safe-area-inset-left, 0px));
  }

  .safe-area-auth {
    padding-top: calc(3rem + env(safe-area-inset-top, 0px));
    padding-right: max(1.25rem, env(safe-area-inset-right, 0px));
    padding-bottom: calc(3rem + env(safe-area-inset-bottom, 0px));
    padding-left: max(1.25rem, env(safe-area-inset-left, 0px));
  }

  /* Espaço reservado para a barra de navegação inferior fixa. */
  .pb-nav {
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  }

  .safe-area-nav {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  /*
   * Ações secundárias de um item de lista (editar, excluir).
   *
   * Escondê-las até o hover deixa o cartão limpo no desktop, mas em uma tela de
   * toque não existe hover: as ações simplesmente nunca apareceriam e não
   * haveria como editar nem excluir nada. Por isso o padrão é visível, e o
   * comportamento de revelar só entra onde há um apontador de fato.
   */
  .hover-reveal {
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    .hover-reveal {
      opacity: 0;
      transition: opacity 150ms var(--ease-out-expo);
    }

    .group:hover .hover-reveal,
    .hover-reveal:focus-within,
    .hover-reveal:focus {
      opacity: 1;
    }
  }

  @media (min-width: 640px) {
    .safe-area-page {
      padding-right: max(1.5rem, env(safe-area-inset-right, 0px));
      padding-left: max(1.5rem, env(safe-area-inset-left, 0px));
    }
  }

  @media (min-width: 1024px) {
    .safe-area-page {
      padding: 2rem;
    }

    .safe-area-auth {
      padding: 3rem 1.25rem;
    }

    .pb-nav {
      padding-bottom: 2rem;
    }
  }
}

/* Some com as setas do input numérico: valores monetários usam máscara. */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Respeita quem pediu menos movimento no sistema operacional. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

```

## `frontend/src/components/common/theme-provider.tsx`

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

import { isTheme, THEME_COLORS, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const themeColor = THEME_COLORS[theme];
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  root.style.backgroundColor = themeColor;
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
}

/** Mantém o tema visual sincronizado com a preferência salva no navegador. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    let initialTheme: Theme = "dark";

    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(storedTheme)) initialTheme = storedTheme;
    } catch {
      // O tema padrão continua disponível quando o storage é bloqueado.
    }

    applyTheme(initialTheme);
    setThemeState(initialTheme);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    applyTheme(nextTheme);
    setThemeState(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // O tema ainda muda na sessão quando o navegador bloqueia o storage.
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <Toaster position="top-right" theme={theme} richColors closeButton />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return context;
}

```

## `frontend/src/lib/theme.ts`

```ts
export const THEME_STORAGE_KEY = "nexosgen-nexosfinn:theme";

export const THEME_COLORS = {
  light: "#FCFCFD",
  dark: "#050505",
} as const;

export type Theme = keyof typeof THEME_COLORS;

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

```
