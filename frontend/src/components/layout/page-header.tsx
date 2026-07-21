"use client";

import { Menu } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Controles à direita: seletor de período, botão de ação, etc. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Cabeçalho de cada tela.
 *
 * Concentra o botão de abrir a sidebar no mobile, evitando repetir a lógica
 * em todas as páginas.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="mt-0.5 rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-sm lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-4" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
