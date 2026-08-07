import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PhoneMockup } from "@/components/landing/phone-mockup";

/**
 * Primeira dobra.
 *
 * Nada aqui é adiado nem animado na entrada: é o conteúdo que define o LCP,
 * então ele chega pronto no HTML. Os cartões flutuantes só aparecem a partir
 * do desktop, onde existe largura para eles sem espremer o texto.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Open Finance · seus bancos em um só lugar
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Seu dinheiro
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              sob controle
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            A nexosgen-financehub organiza seus gastos sozinha, mostra para onde seu dinheiro vai e responde às suas
            perguntas sobre ele.
          </p>

          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            Abrir minha conta
            <ArrowUpRight className="size-4" />
          </Link>

          <p className="mt-3 text-xs text-muted-foreground">
            Grátis para começar · sem cartão de crédito
          </p>
        </div>

        <div className="relative">
          <PhoneMockup />

          {/* Cartões flutuantes: profundidade leve, só onde há espaço. */}
          <div className="absolute -left-4 top-16 hidden w-40 rounded-2xl border border-border bg-card p-3 shadow-card lg:block">
            <p className="text-[11px] text-muted-foreground">Economia do mês</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">R$ 1.240</p>
            <p className="text-[11px] font-medium text-positive">↑ 18% vs mês anterior</p>
          </div>

          <div className="absolute -right-2 bottom-20 hidden w-44 rounded-2xl border border-border bg-card p-3 shadow-card lg:block">
            <p className="text-[11px] text-muted-foreground">Meta: Viagem</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[68%] rounded-full bg-primary" />
            </div>
            <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">
              R$ 6.800 de R$ 10.000
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
