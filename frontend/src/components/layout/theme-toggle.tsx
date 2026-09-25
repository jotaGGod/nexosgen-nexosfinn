"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/common/theme-provider";

/**
 * Alterna entre o tema escuro (identidade primária da NexosFinn) e o claro.
 *
 * Fica no cabeçalho do desktop e no menu do celular.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const escuro = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(escuro ? "light" : "dark")}
      className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground transition-colors hover:text-foreground"
      aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
    >
      {escuro ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}
