"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/common/theme-provider";

/**
 * Alterna entre o tema escuro (identidade primária da Vanta) e o claro.
 *
 * Fica no cabeçalho porque, sem barra lateral, é onde sobra espaço para
 * controles globais.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const escuro = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(escuro ? "light" : "dark")}
      className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
    >
      {escuro ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
