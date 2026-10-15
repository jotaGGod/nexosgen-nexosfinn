"use client";

import { ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, CheckCircle2, MinusCircle, PlusCircle, Wallet } from "lucide-react";
import Link from "next/link";

import { Variation } from "@/components/common/variation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercentage } from "@/lib/format";
import type { DashboardSummary } from "@/types/api";

/*
 * Blocos de resumo do início.
 *
 * Todos leem o mesmo `summary` da chamada única a /dashboard; só a
 * composição muda entre celular (cartão de saldo no degradê + lista) e
 * desktop (painel largo de métricas + cartão de saldo).
 */

/** Saldo mobile integrado ao fundo contínuo, sem outra moldura no topo. */
export function BalanceCard({ summary }: { summary?: DashboardSummary }) {
  return (
    <div className="mobile-balance">
      <div className="flex items-center justify-between">
        <p className="text-sm">Saldo total</p>
        <Link href="/app/contas" aria-label="Ver minhas contas" className="mobile-balance-link flex size-11 items-center justify-center rounded-full">
          <ArrowUpRight className="size-5" />
        </Link>
      </div>

      {summary ? (
        <>
          <p className="mobile-balance-amount font-semibold tracking-[-0.045em] tabular-nums">
            {summary.total_balance.formatted}
          </p>
          <Variation
            className="mobile-balance-variation mt-2.5 flex-wrap"
            value={summary.total_balance.variation}
            label="vs mês anterior"
          />
        </>
      ) : (
        <div className="mt-2 flex flex-col gap-2.5">
          <Skeleton className="h-8 w-44 bg-white/10" />
          <Skeleton className="h-3 w-28 bg-white/10" />
        </div>
      )}
    </div>
  );
}

/** Métricas reais em cartões azuis; nenhum cartão bancário fictício. */
export function SummaryList({ summary }: { summary?: DashboardSummary }) {
  const linhas = summary
    ? [
        { rotulo: "Receitas", metrica: summary.income, invert: false, icon: ArrowDownLeft },
        { rotulo: "Despesas", metrica: summary.expense, invert: true, icon: ArrowUpRight },
        { rotulo: "Economia", metrica: summary.savings, invert: false, icon: ChartNoAxesCombined },
      ]
    : [];

  return (
    <div className="mobile-summary">
      {summary ? (
        <ul className="mobile-metric-grid">
          {linhas.map((linha) => {
            const Icon = linha.icon;
            return (
              <li key={linha.rotulo} className="mobile-metric">
                <div className="mobile-metric-heading flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{linha.rotulo}</p>
                  <Icon aria-hidden className="size-4 shrink-0" />
                </div>
                <p className="mobile-metric-amount font-semibold tabular-nums">{linha.metrica.formatted}</p>
                <Variation className="mobile-metric-variation mt-1.5 flex-wrap [&>span:last-child]:hidden" value={linha.metrica.variation} invert={linha.invert} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mobile-metric-grid" aria-label="Carregando resumo">
          {Array.from({ length: 3 }).map((_, indice) => (
            <div key={indice} className="mobile-metric space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Atalhos do celular: registrar despesa, registrar receita, ver lançamentos. */
export function QuickActions({ onAdd }: { onAdd: (type: "expense" | "income") => void }) {
  const base = "mobile-quick-action flex min-w-0 flex-col items-center gap-2.5 rounded-2xl py-2 text-center active:scale-[0.97]";

  return (
    <section className="surface mobile-quick-actions" aria-label="Ações rápidas">
      <h2 className="text-sm font-semibold">Ações rápidas</h2>
      <div className="mt-3 grid grid-cols-4 gap-1">
      <button type="button" onClick={() => onAdd("expense")} className={base}>
        <span className="mobile-action-icon"><MinusCircle strokeWidth={1.7} /></span>
        <span className="text-xs font-medium">Despesa</span>
      </button>
      <button type="button" onClick={() => onAdd("income")} className={base}>
        <span className="mobile-action-icon"><PlusCircle strokeWidth={1.7} /></span>
        <span className="text-xs font-medium">Receita</span>
      </button>
      <Link href="/app/transacoes" className={base}>
        <span className="mobile-action-icon"><CheckCircle2 strokeWidth={1.7} /></span>
        <span className="text-xs font-medium">Transações</span>
      </Link>
      <Link href="/app/contas" className={base}>
        <span className="mobile-action-icon"><Wallet strokeWidth={1.7} /></span>
        <span className="text-xs font-medium">Contas</span>
      </Link>
      </div>
    </section>
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
