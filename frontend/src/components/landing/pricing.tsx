"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Destaque, Halo, Section, SectionHeading } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

interface Plano {
  nome: string;
  descricao: string;
  mensal: number;
  anual: number;
  recursos: string[];
  destaque?: boolean;
}

const planos: Plano[] = [
  {
    nome: "Grátis",
    descricao: "Para entender para onde vai seu dinheiro.",
    mensal: 0,
    anual: 0,
    recursos: [
      "1 conta conectada",
      "Categorização automática",
      "Relatórios do mês corrente",
      "Metas ilimitadas",
    ],
  },
  {
    nome: "Pro",
    descricao: "Para quem quer decidir com dado na mão.",
    mensal: 19.9,
    anual: 15.9,
    destaque: true,
    recursos: [
      "Contas ilimitadas",
      "Assistente de IA sem limite",
      "Histórico completo e comparativos",
      "Orçamento por categoria com alerta",
      "Exportação em CSV e PDF",
    ],
  },
  {
    nome: "Família",
    descricao: "Para o orçamento que é de mais de um.",
    mensal: 34.9,
    anual: 27.9,
    recursos: [
      "Tudo do Pro",
      "Até 5 pessoas na mesma conta",
      "Carteiras compartilhadas",
      "Metas em conjunto",
    ],
  },
];

/** Formata o preço mensal do plano em reais. */
function formatarPreco(valor: number): string {
  if (valor === 0) return "R$ 0";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Planos com alternância entre cobrança mensal e anual.
 *
 * É um dos poucos trechos interativos da página; por isso vive isolado num
 * componente de cliente, enquanto o restante permanece estático.
 */
export function Pricing() {
  const [anual, setAnual] = useState(true);

  return (
    <Section id="planos">
      <SectionHeading
        eyebrow="Planos"
        titulo={
          <>
            Comece de graça, <Destaque>pague quando fizer sentido</Destaque>
          </>
        }
        texto="Sem fidelidade. Cancele quando quiser, direto pelo aplicativo."
      />

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <div
          className="inline-flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1"
          role="group"
          aria-label="Período de cobrança"
        >
          <button
            type="button"
            aria-pressed={!anual}
            onClick={() => setAnual(false)}
            className={cn(
              "min-h-10 min-w-24 rounded-lg px-5 text-sm font-semibold transition-colors duration-300",
              !anual ? "bg-white/[0.1] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Mensal
          </button>
          <button
            type="button"
            aria-pressed={anual}
            onClick={() => setAnual(true)}
            className={cn(
              "min-h-10 min-w-24 rounded-lg px-5 text-sm font-semibold transition-colors duration-300",
              anual ? "bg-white/[0.1] text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Anual
          </button>
        </div>
        <span className="rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-bold text-primary-foreground">
          Economize 20% no anual
        </span>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1100px] items-stretch gap-4 lg:grid-cols-3">
        {planos.map((plano, indice) => (
          <Reveal key={plano.nome} delay={indice * 80} className="h-full">
            <article
              className={cn(
                "lp-card lp-card-hover relative flex h-full flex-col overflow-hidden p-6 sm:p-7",
                plano.destaque && "border-primary/35 bg-[linear-gradient(175deg,rgba(255,106,26,0.12),#0D0D0D_45%)]",
              )}
            >
              {plano.destaque ? (
                <>
                  <Halo className="-top-40 left-1/2 size-[420px] -translate-x-1/2" intensity={0.22} />
                  <span className="absolute inset-x-0 top-0 bg-gradient-to-r from-primary to-accent py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-primary-foreground">
                    Mais popular
                  </span>
                </>
              ) : null}

              <div className={cn("relative", plano.destaque && "pt-6")}>
                <h3 className="text-lg font-semibold tracking-tight">{plano.nome}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plano.descricao}</p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tabular-nums tracking-[-0.03em]">
                    {formatarPreco(anual && plano.mensal > 0 ? plano.anual * 12 : plano.mensal)}
                  </span>
                  {plano.mensal > 0 ? (
                    <span className="text-sm text-muted-foreground">/{anual ? "ano" : "mês"}</span>
                  ) : null}
                </p>
                <p className="mt-1 h-4 text-xs text-muted-foreground">
                  {anual && plano.mensal > 0 ? `equivale a ${formatarPreco(plano.anual)}/mês` : ""}
                </p>
              </div>

              <div className="relative mt-6 flex-1 border-t border-white/[0.07] pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">O que está incluso</p>
                <ul className="mt-4 space-y-3">
                  {plano.recursos.map((recurso) => (
                    <li key={recurso} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Check className="size-3" />
                      </span>
                      <span className="text-foreground/80">{recurso}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/cadastro"
                className={cn(
                  "relative mt-8 flex min-h-12 items-center justify-center rounded-xl px-4 text-center text-sm font-semibold transition-[transform,background-color,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0",
                  plano.destaque
                    ? "bg-primary text-primary-foreground shadow-[0_12px_32px_-12px_rgba(255,106,26,0.75)] hover:shadow-[0_18px_40px_-12px_rgba(255,106,26,0.9)]"
                    : "border border-white/10 bg-white/[0.05] text-foreground hover:border-white/20 hover:bg-white/[0.09]",
                )}
              >
                {plano.mensal === 0 ? "Começar grátis" : `Assinar ${plano.nome}`}
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
