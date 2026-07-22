"use client";

import Link from "next/link";
import { useState } from "react";

import { PeriodPicker, monthPeriod, type PeriodValue } from "@/components/common/period-picker";
import {
  CashflowChart,
  CashflowLegend,
  CategoryDonut,
  useChartPreload,
} from "@/components/dashboard/lazy-charts";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards, SummaryCardsSkeleton } from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { useDashboard } from "@/hooks/use-finapp";
import { todayISO } from "@/lib/format";

/**
 * Tela inicial.
 *
 * Todo o conteúdo vem de uma única chamada a /dashboard: os quatro cards, o
 * fluxo de caixa, a distribuição por categoria, os lançamentos recentes e as
 * metas chegam juntos, o que evita cinco estados de carregamento na mesma tela.
 */
export function DashboardView() {
  useChartPreload();

  const [period, setPeriod] = useState<PeriodValue>(() => monthPeriod(todayISO()));

  const { data, isPending, isError, refetch } = useDashboard({
    start_date: period.start,
    end_date: period.end,
    cashflow_months: 5,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas finanças"
        actions={<PeriodPicker value={period} onChange={setPeriod} />}
      />

      {isError ? (
        <Card>
          <ErrorState
            description="Não conseguimos carregar seus dados agora."
            onRetry={() => void refetch()}
          />
        </Card>
      ) : null}

      {isPending && !isError ? <SummaryCardsSkeleton /> : null}
      {data ? <SummaryCards summary={data.summary} /> : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CashflowLegend />
          </CardHeader>
          <CardContent>
            {isPending ? <ChartSkeleton className="p-0" /> : null}
            {data ? <CashflowChart data={data.cashflow} /> : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? <ChartSkeleton className="p-0" /> : null}
            {data ? <CategoryDonut distribution={data.category_expenses} /> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Transações Recentes</CardTitle>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/app/transacoes">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isPending ? <RowsSkeleton className="p-0" rows={5} /> : null}
            {data ? <RecentTransactions items={data.recent_transactions} /> : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Metas</CardTitle>
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href="/app/metas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isPending ? <RowsSkeleton className="p-0" rows={3} /> : null}
            {data ? <GoalsSummary goals={data.goals} /> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
