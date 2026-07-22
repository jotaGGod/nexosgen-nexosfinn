"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
 * É o único trecho interativo da página; por isso vive isolado num componente
 * de cliente, enquanto o restante permanece estático.
 */
export function Pricing() {
  const [anual, setAnual] = useState(true);

  return (
    <section id="planos" className="mx-auto mt-32 w-full max-w-6xl scroll-mt-24 px-5">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Planos</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Comece de graça, pague quando fizer sentido
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Sem fidelidade. Cancele quando quiser, direto pelo aplicativo.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={cn("text-sm", anual ? "text-muted-foreground" : "font-medium text-foreground")}>
          Mensal
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={anual}
          aria-label="Alternar entre cobrança mensal e anual"
          onClick={() => setAnual((valor) => !valor)}
          className={cn(
            "relative h-7 w-12 rounded-full border border-border transition-colors",
            anual ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-background transition-transform duration-200 ease-out-expo",
              anual ? "translate-x-[24px]" : "translate-x-[3px]",
            )}
          />
        </button>

        <span className={cn("text-sm", anual ? "font-medium text-foreground" : "text-muted-foreground")}>
          Anual
        </span>
        <span className="rounded-2xl bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
          -20%
        </span>
      </div>

      <div className="mt-12 grid items-start gap-4 lg:grid-cols-3">
        {planos.map((plano, indice) => (
          <Reveal
            key={plano.nome}
            delay={indice * 70}
            className={cn(
              "surface relative flex flex-col p-6",
              plano.destaque && "border-primary/40 lg:-mt-4 lg:pb-10",
            )}
          >
            {plano.destaque ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-2xl bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Mais popular
              </span>
            ) : null}

            <h3 className="font-semibold tracking-tight">{plano.nome}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plano.descricao}</p>

            <p className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tabular-nums tracking-tight">
                {formatarPreco(anual ? plano.anual : plano.mensal)}
              </span>
              {plano.mensal > 0 ? (
                <span className="text-sm text-muted-foreground">/mês</span>
              ) : null}
            </p>
            <p className="mt-1 h-4 text-xs text-muted-foreground">
              {anual && plano.mensal > 0 ? "cobrado anualmente" : ""}
            </p>

            <ul className="mt-6 flex-1 space-y-3">
              {plano.recursos.map((recurso) => (
                <li key={recurso} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{recurso}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/cadastro"
              className={cn(
                "mt-7 rounded-2xl px-4 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90",
                plano.destaque
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground",
              )}
            >
              {plano.mensal === 0 ? "Começar grátis" : `Assinar ${plano.nome}`}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
