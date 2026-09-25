"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const ancoras = [
  { href: "#recursos", label: "Recursos" },
  { href: "#analises", label: "Análises" },
  { href: "#integracoes", label: "Integrações" },
  { href: "#planos", label: "Planos" },
  { href: "#duvidas", label: "Dúvidas" },
];

/**
 * Cabeçalho fixo da página de vendas.
 *
 * Desktop: logo à esquerda, navegação central numa pílula e CTA à direita. A
 * pílula marca a seção visível no momento. Sobre o topo da página o cabeçalho
 * fica transparente; ao rolar ele ganha fundo quase opaco e borda.
 *
 * Celular: logo à esquerda e menu à direita, que abre um painel com entrada
 * escalonada. O painel fecha ao escolher um destino, com Esc ou ao voltar
 * para a largura de desktop.
 */
export function LandingHeader() {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState<string | null>(null);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8);
    aoRolar();

    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Marca na pílula a seção que ocupa o meio da tela.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const secoes = ancoras
      .map((ancora) => document.querySelector<HTMLElement>(ancora.href))
      .filter((secao): secao is HTMLElement => secao !== null);

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) setAtiva(`#${entrada.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    secoes.forEach((secao) => observer.observe(secao));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    const aoRedimensionar = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setAberto(false);
    };

    window.addEventListener("keydown", aoTeclar);
    window.addEventListener("resize", aoRedimensionar);
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("resize", aoRedimensionar);
    };
  }, [aberto]);

  const solido = rolou || aberto;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:px-5">
      <div
        className={cn(
          "mx-auto w-full max-w-[1240px] rounded-[22px] border transition-[background-color,border-color,box-shadow] duration-300",
          solido
            ? // Fundo quase opaco, sem backdrop-filter: o desfoque seria
              // recalculado a cada quadro sobre o aparelho em movimento.
              "border-white/[0.08] bg-[#0A0A0A]/[0.94] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4 pl-4 pr-2.5 sm:pl-5 sm:pr-3">
          <Link href="/" aria-label="NexosFinn, início" className="rounded-lg">
            <Logo priority />
          </Link>

          <nav
            className="hidden items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 md:flex"
            aria-label="Seções"
          >
            {ancoras.map((ancora) => (
              <a
                key={ancora.href}
                href={ancora.href}
                aria-current={ativa === ancora.href ? "true" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors lg:px-4",
                  ativa === ancora.href
                    ? "bg-white/[0.08] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {ancora.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="group hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] py-1.5 pl-4 pr-1.5 text-sm font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.1] md:inline-flex"
            >
              Criar conta
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-300 ease-out-expo group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setAberto((valor) => !valor)}
              aria-expanded={aberto}
              aria-controls="menu-landing"
              aria-label={aberto ? "Fechar menu" : "Abrir menu"}
              className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-foreground transition-colors hover:bg-white/[0.1] md:hidden"
            >
              {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/*
         * Painel do celular.
         *
         * A altura anima pelo truque do grid (0fr → 1fr), que não exige medir
         * o conteúdo; os itens entram escalonados só com opacidade e
         * deslocamento. `inert` tira os links fechados da ordem de tabulação.
         */}
        <div
          id="menu-landing"
          inert={!aberto}
          className={cn(
            "grid transition-[grid-template-rows] duration-500 ease-out-expo md:hidden",
            aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <nav className="flex flex-col gap-1 px-3 pb-3" aria-label="Seções">
              {ancoras.map((ancora, indice) => (
                <a
                  key={ancora.href}
                  href={ancora.href}
                  onClick={() => setAberto(false)}
                  className={cn(
                    "flex min-h-12 items-center justify-between rounded-xl px-3 text-base font-medium text-foreground/90 transition-[opacity,transform,background-color] duration-500 ease-out-expo hover:bg-white/[0.05]",
                    aberto ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                  )}
                  style={{ transitionDelay: aberto ? `${60 + indice * 40}ms` : "0ms" }}
                >
                  {ancora.label}
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </a>
              ))}

              <div
                className={cn(
                  "mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-3 transition-[opacity,transform] duration-500 ease-out-expo",
                  aberto ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: aberto ? `${60 + ancoras.length * 40}ms` : "0ms" }}
              >
                <Link
                  href="/login"
                  className="flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-foreground"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Criar conta
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
