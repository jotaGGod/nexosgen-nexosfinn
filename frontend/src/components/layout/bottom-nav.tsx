"use client";

import { LayoutGrid, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { primaryNavItems, secondaryNavItems } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Navegação inferior fixa, exclusiva de telas até `lg`.
 *
 * O critério de layout aqui é o alcance do polegar. De `lg` em diante quem
 * navega é a barra lateral, que mostra os oito destinos de uma vez — por isso
 * esta barra e sua gaveta somem por completo nesse ponto, em vez de coexistir
 * com a lateral.
 *
 * Quatro destinos diretos mais uma gaveta para o restante — cinco alvos é o
 * máximo que cabe confortavelmente na largura de um celular.
 */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [saindo, setSaindo] = useState(false);

  // Navegar fecha a gaveta, inclusive quando o usuário usa voltar/avançar.
  useEffect(() => {
    setGavetaAberta(false);
  }, [pathname]);

  // Trava a rolagem do fundo enquanto a gaveta cobre a tela.
  useEffect(() => {
    if (!gavetaAberta) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [gavetaAberta]);

  const gavetaAtiva = secondaryNavItems.some((item) => pathname.startsWith(item.href));

  async function sair() {
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Servidor fora do ar não pode impedir o usuário de sair.
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {gavetaAberta ? (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setGavetaAberta(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Gaveta do "Mais" */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] transition-all duration-300 ease-out-expo lg:hidden",
          gavetaAberta ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        role="dialog"
        aria-label="Mais seções"
        aria-hidden={!gavetaAberta}
      >
        <div className="surface overflow-hidden p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mais
            </span>
            <button
              type="button"
              onClick={() => setGavetaAberta(false)}
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Fechar"
              tabIndex={gavetaAberta ? 0 : -1}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {secondaryNavItems.map((item) => {
              const ativo = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  tabIndex={gavetaAberta ? 0 : -1}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    ativo
                      ? "bg-active/10 text-active"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            tabIndex={gavetaAberta ? 0 : -1}
            className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <LogOut className="size-[18px] shrink-0" />
            {saindo ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </div>

      {/* Barra fixa */}
      <nav
        className="safe-area-nav fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-4 lg:hidden"
        aria-label="Navegação principal"
      >
        <div className="glass-panel flex items-center justify-around gap-1 rounded-[28px] p-1.5 shadow-2xl">
          {primaryNavItems.map((item) => {
            const ativo = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors",
                  ativo
                    ? "bg-active/10 text-active"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-[19px]" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setGavetaAberta((aberta) => !aberta)}
            aria-expanded={gavetaAberta}
            className={cn(
              "flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition-colors",
              gavetaAberta || gavetaAtiva
                ? "bg-active/10 text-active"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-[19px]" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
