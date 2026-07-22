"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Cabeçalho do aplicativo.
 *
 * Enxuto de propósito: com a navegação na barra inferior, o topo só precisa
 * carregar a marca e dois controles. Isso devolve altura vertical para o
 * conteúdo, que é o recurso escasso em tela de celular.
 */
export function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link href="/app/dashboard" aria-label="Ir para o início">
        <Logo />
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="size-[18px]" />
          <span
            className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}
