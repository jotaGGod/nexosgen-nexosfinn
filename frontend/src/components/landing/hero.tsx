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
    <section className="ambient-grid relative min-h-dvh overflow-hidden pb-20 pt-[calc(8rem+env(safe-area-inset-top,0px))] sm:pt-36 lg:flex lg:items-center lg:pb-10 lg:pt-24">
      <div
        className="pointer-events-none absolute -right-48 top-8 size-[720px] rounded-full bg-primary/[0.075] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 lg:grid-cols-12 lg:gap-6">
        {/*
         * min-w-0 é necessário aqui.
         *
         * Um item de grid recusa encolher abaixo da largura do seu próprio
         * conteúdo por padrão (min-width: auto implícito). Sem isto, o
         * parágrafo com `max-w-xl` empurra a coluna além da largura
         * disponível, e como a seção tem `overflow-hidden`, o texto some
         * cortado na borda em vez de quebrar a linha.
         */}
        <div className="min-w-0 lg:col-span-6 lg:-translate-y-40">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-xl">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.75)]" aria-hidden="true" />
            Open Finance · seus bancos em um só lugar
          </span>

          <h1 className="mt-8 text-[2.65rem] font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Seu dinheiro
            <br />
            {/*
             * O `pr-[0.08em]` compensa o espaçamento negativo do título.
             *
             * `bg-clip-text` pinta o degradê apenas dentro da caixa do
             * elemento, e o `tracking` negativo encurta essa caixa em relação
             * ao desenho real do último glifo. A sobra da última letra ficava
             * sem degradê e, com o texto transparente, sumia — parecia cortada.
             */}
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text pr-[0.08em] text-transparent">
              sob controle
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
            A NexosFinn organiza seus gastos sozinha, mostra para onde seu dinheiro vai e responde às suas
            perguntas sobre ele.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/cadastro"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Abrir minha conta
              <ArrowUpRight className="size-4" />
            </Link>
            <p className="text-xs text-muted-foreground">Grátis para começar · sem cartão de crédito</p>
          </div>
        </div>

        <div className="relative min-w-0 lg:col-span-6">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
