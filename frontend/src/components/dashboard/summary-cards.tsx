"use client";

import { ArrowUpRight, CheckCircle2, MinusCircle, PlusCircle, Wallet } from "lucide-react";
import Link from "next/link";

import { Variation } from "@/components/common/variation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercentage } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/api";

/*
 * Blocos de resumo do início.
 *
 * Todos leem o mesmo `summary` da chamada única a /dashboard; só a
 * composição muda entre celular (cartão de saldo no degradê + lista) e
 * desktop (painel largo de métricas + cartão de saldo).
 */

/** Cartão escuro do saldo, pousado sobre o degradê do topo no celular. */
export function BalanceCard({ summary }: { summary?: DashboardSummary }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#0B0B0B] p-5 text-white shadow-[0_24px_50px_-24px_rgba(90,30,0,0.75)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Saldo total</p>
        <span className="flex size-9 items-center justify-center rounded-full bg-white/[0.08]">
          <Wallet className="size-4 text-primary" />
        </span>
      </div>

      {summary ? (
        <>
          <p className="mt-5 text-right text-[2.1rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">
            {summary.total_balance.formatted}
          </p>
          <Variation
            className="mt-2.5 justify-end [&>span:last-child]:text-white/55"
            value={summary.total_balance.variation}
            label="vs mês anterior"
          />
        </>
      ) : (
        <div className="mt-5 flex flex-col items-end gap-2.5">
          <Skeleton className="h-8 w-44 bg-white/10" />
          <Skeleton className="h-3 w-28 bg-white/10" />
        </div>
      )}
    </div>
  );
}

/** Receitas, despesas e economia em linhas — a lista logo abaixo do topo. */
export function SummaryList({ summary }: { summary?: DashboardSummary }) {
  const linhas = summary
    ? [
        { rotulo: "Receitas", metrica: summary.income, invert: false, tom: "text-positive" },
        { rotulo: "Despesas", metrica: summary.expense, invert: true, tom: "text-negative" },
        { rotulo: "Economia", metrica: summary.savings, invert: false, tom: "text-foreground" },
      ]
    : [];

  return (
    <Card className="px-5 py-2">
      {summary ? (
        <ul className="divide-y divide-border/70">
          {linhas.map((linha) => (
            <li key={linha.rotulo} className="flex items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="text-sm text-foreground/90">{linha.rotulo}</p>
                <Variation
                  className="mt-0.5 [&>span:last-child]:hidden"
                  value={linha.metrica.variation}
                  invert={linha.invert}
                />
              </div>
              <p className={cn("shrink-0 text-base font-semibold tabular-nums", linha.tom)}>
                {linha.metrica.formatted}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4 py-3.5">
          {Array.from({ length: 3 }).map((_, indice) => (
            <div key={indice} className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/** Atalhos do celular: registrar despesa, registrar receita, ver lançamentos. */
export function QuickActions({ onAdd }: { onAdd: (type: "expense" | "income") => void }) {
  const base =
    "flex min-h-[108px] flex-col justify-between rounded-[26px] border border-border/80 bg-card p-4 text-left transition-transform duration-200 ease-out-expo active:scale-[0.96]";

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <button type="button" onClick={() => onAdd("expense")} className={base}>
        <MinusCircle className="ml-auto size-6 text-foreground/80" strokeWidth={1.6} />
        <span>
          <span className="block text-[11px] text-muted-foreground">Adicionar</span>
          <span className="block text-base font-semibold tracking-tight">Despesa</span>
        </span>
      </button>
      <button type="button" onClick={() => onAdd("income")} className={base}>
        <PlusCircle className="ml-auto size-6 text-primary" strokeWidth={1.6} />
        <span>
          <span className="block text-[11px] text-muted-foreground">Adicionar</span>
          <span className="block text-base font-semibold tracking-tight text-primary">Receita</span>
        </span>
      </button>
      <Link href="/app/transacoes" className={base}>
        <CheckCircle2 className="ml-auto size-6 text-foreground/80" strokeWidth={1.6} />
        <span>
          <span className="block text-[11px] text-muted-foreground">Ver</span>
          <span className="block text-base font-semibold tracking-tight">Transações</span>
        </span>
      </Link>
    </div>
  );
}

/** Uma métrica do painel largo do desktop, com a barra de proporção embaixo. */
function Metrica({
  rotulo,
  valor,
  variacao,
  invert,
  barra,
  legenda,
  destaque,
}: {
  rotulo: string;
  valor: string;
  variacao: number;
  invert?: boolean;
  barra: number;
  legenda: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col px-7 first:pl-0 last:pr-0">
      <p className="text-sm text-muted-foreground">{rotulo}</p>
      <p className="mt-2 truncate text-[2rem] font-medium leading-tight tracking-[-0.03em] tabular-nums">{valor}</p>
      <Variation className="mt-1.5" value={variacao} invert={invert} label="vs mês anterior" />
      <div className="mt-auto pt-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{legenda}</span>
          <span className="tabular-nums">{formatPercentage(barra, 0)}</span>
        </div>
        <Progress
          value={barra}
          size="lg"
          striped={destaque}
          color={destaque ? undefined : "hsl(var(--foreground) / 0.22)"}
        />
      </div>
    </div>
  );
}

/**
 * Painel de resumo do desktop: receitas, despesas e economia lado a lado num
 * painel largo, e o saldo num cartão próprio à direita.
 *
 * As barras comparam tudo com a receita do período: despesas mostram quanto
 * da receita foi gasto, economia usa a taxa de poupança que o backend já
 * calcula. Nada é inventado — são proporções dos próprios números da tela.
 */
export function DesktopSummary({ summary, onNew }: { summary: DashboardSummary; onNew: () => void }) {
  const receita = summary.income.value;
  const gastoDaReceita = receita > 0 ? Math.min((summary.expense.value / receita) * 100, 100) : 0;
  const poupanca = Math.max(Math.min(summary.savings_rate, 100), 0);

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-8 flex p-7">
        <div className="grid w-full grid-cols-3 divide-x divide-border/70">
          <Metrica
            rotulo="Receitas"
            valor={summary.income.formatted}
            variacao={summary.income.variation}
            barra={receita > 0 ? 100 : 0}
            legenda="Entradas do período"
            destaque
          />
          <Metrica
            rotulo="Despesas"
            valor={summary.expense.formatted}
            variacao={summary.expense.variation}
            invert
            barra={gastoDaReceita}
            legenda="Da receita gasta"
          />
          <Metrica
            rotulo="Economia"
            valor={summary.savings.formatted}
            variacao={summary.savings.variation}
            barra={poupanca}
            legenda="Taxa de poupança"
          />
        </div>
      </Card>

      <Card className="relative col-span-4 flex flex-col overflow-hidden p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.28),transparent_65%)]"
        />
        <div className="relative flex items-start justify-between">
          <p className="text-sm text-muted-foreground">Saldo total</p>
          <Link
            href="/app/contas"
            aria-label="Ver contas"
            className="flex size-10 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <p className="relative mt-2 text-[2.6rem] font-medium leading-tight tracking-[-0.035em] tabular-nums">
          {summary.total_balance.formatted}
        </p>
        <Variation className="relative mt-1.5" value={summary.total_balance.variation} label="vs mês anterior" />

        <div className="relative mt-auto flex items-center gap-2 pt-8">
          <Button variant="contrast" onClick={onNew} className="flex-1">
            <PlusCircle />
            Nova transação
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/contas">Contas</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function DesktopSummarySkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-8 grid grid-cols-3 gap-8 p-7">
        {Array.from({ length: 3 }).map((_, indice) => (
          <div key={indice} className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-8 h-4 w-full rounded-full" />
          </div>
        ))}
      </Card>
      <Card className="col-span-4 space-y-3 p-7">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-8 h-11 w-full rounded-full" />
      </Card>
    </div>
  );
}
