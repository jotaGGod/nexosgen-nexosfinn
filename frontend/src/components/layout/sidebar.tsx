"use client";

import { ChevronRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";

import { Logo } from "@/components/layout/logo";
import { navItems } from "@/components/layout/nav";
import { UserMenu } from "@/components/layout/user-menu";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

/**
 * Navegação lateral fixa.
 *
 * No desktop fica sempre visível; no mobile vira uma gaveta sobreposta, que
 * fecha sozinha ao navegar.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [mobileTop, setMobileTop] = useState(0);

  /*
   * No Safari 26, exibir uma camada `position: fixed` faz o navegador criar
   * novamente as faixas sólidas acima e abaixo da página. A gaveta móvel fica
   * absoluta na posição atual do documento; no desktop ela continua fixa.
   */
  useLayoutEffect(() => {
    if (sidebarOpen) setMobileTop(window.scrollY);
  }, [sidebarOpen]);

  const mobilePosition = {
    "--sidebar-mobile-top": `${mobileTop}px`,
  } as CSSProperties;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {sidebarOpen ? (
        <div
          style={mobilePosition}
          className="absolute inset-x-0 top-[var(--sidebar-mobile-top)] z-40 h-[100lvh] touch-none bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        style={mobilePosition}
        className={cn(
          "sidebar-scroll absolute left-0 top-[var(--sidebar-mobile-top)] z-50 flex h-[100lvh] w-[264px] flex-col overflow-y-auto overscroll-contain bg-sidebar transition-transform duration-300 lg:fixed lg:inset-y-0 lg:h-auto lg:top-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="safe-area-sidebar-top flex items-center justify-between px-5 pb-6">
          <Link href="/dashboard" aria-label="Ir para o dashboard">
            <Logo />
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-violet-600/15 text-white shadow-[inset_0_0_0_1px_rgba(124,58,237,0.35)]"
                    : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className={cn("size-[18px] shrink-0", active && "text-violet-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-6">
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-4 ring-1 ring-inset ring-violet-500/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="size-4 text-violet-300" />
              Upgrade Pro
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Desbloqueie recursos avançados de análise e automação.
            </p>
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Upgrade
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="safe-area-sidebar-bottom border-t border-sidebar-border px-3 pt-3">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
