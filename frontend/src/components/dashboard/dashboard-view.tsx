"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { PeriodPicker, monthPeriod, type PeriodValue } from "@/components/common/period-picker";
import { useDashboardPreferences } from "@/components/dashboard/dashboard-preferences";
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
import { useDashboard } from "@/hooks/use-nexosgen-nexosfinn";
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
  const { preferences } = useDashboardPreferences();

  const start = new Date(`${period.start}T00:00:00Z`);
  const end = new Date(`${period.end}T00:00:00Z`);
  const monthsInPeriod = Math.max(
    1,
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1,
  );

  const { data, isPending, isError, refetch } = useDashboard({
    start_date: period.start,
    end_date: period.end,
    cashflow_months: Math.min(24, Math.max(5, monthsInPeriod)),
  });

  const showPrimaryAnalytics = preferences.cashflow || preferences.categories;
  const showSecondaryAnalytics = preferences.transactions || preferences.goals;
  const hasVisibleSection = preferences.summary || showPrimaryAnalytics || showSecondaryAnalytics;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas finanças"
        actions={<PeriodPicker mode="advanced" value={period} onChange={setPeriod} />}
      />

      {isError ? (
        <Card>
          <ErrorState
            description="Não conseguimos carregar seus dados agora."
            onRetry={() => void refetch()}
          />
        </Card>
      ) : null}

      {preferences.summary && isPending && !isError ? <SummaryCardsSkeleton /> : null}
      {preferences.summary && data ? <SummaryCards summary={data.summary} /> : null}

      {showPrimaryAnalytics ? <div className="grid gap-4 lg:grid-cols-5">
        {preferences.cashflow ? <Card className={preferences.categories ? "lg:col-span-3" : "lg:col-span-5"}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CashflowLegend />
          </CardHeader>
          <CardContent>
            {isPending ? <ChartSkeleton className="p-0" /> : null}
            {data ? <CashflowChart data={data.cashflow} /> : null}
          </CardContent>
        </Card> : null}

        {preferences.categories ? <Card className={preferences.cashflow ? "lg:col-span-2" : "lg:col-span-5"}>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? <ChartSkeleton className="p-0" /> : null}
            {data ? <CategoryDonut distribution={data.category_expenses} /> : null}
          </CardContent>
        </Card> : null}
      </div> : null}

      {showSecondaryAnalytics ? <div className="grid gap-4 lg:grid-cols-5">
        {preferences.transactions ? <Card className={preferences.goals ? "lg:col-span-3" : "lg:col-span-5"}>
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
        </Card> : null}

        {preferences.goals ? <Card className={preferences.transactions ? "lg:col-span-2" : "lg:col-span-5"}>
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
        </Card> : null}
      </div> : null}

      {!hasVisibleSection ? (
        <Card className="p-8 text-center">
          <SlidersHorizontal className="mx-auto size-6 text-active" />
          <p className="mt-3 text-sm font-semibold">Sua tela inicial está vazia</p>
          <p className="mt-1 text-sm text-muted-foreground">Escolha os blocos que deseja acompanhar nas preferências.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/app/configuracoes?tab=preferencias">Personalizar Dashboard</Link>
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
