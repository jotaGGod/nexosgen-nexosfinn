"use client";

import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { PeriodPicker, monthPeriod, type PeriodValue } from "@/components/common/period-picker";
import { CategoryBars } from "@/components/dashboard/category-bars";
import { useDashboardPreferences } from "@/components/dashboard/dashboard-preferences";
import { CashflowChart, CashflowLegend, useChartPreload } from "@/components/dashboard/lazy-charts";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import {
  BalanceCard,
  DesktopSummary,
  DesktopSummarySkeleton,
  QuickActions,
  SummaryList,
} from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { useDashboard, useProfile } from "@/hooks/use-nexosgen-nexosfinn";
import { todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Tela inicial.
 *
 * Todo o conteúdo vem de uma única chamada a /dashboard: resumo, fluxo de
 * caixa, distribuição por categoria, lançamentos recentes e metas chegam
 * juntos, o que evita cinco estados de carregamento na mesma tela.
 *
 * Celular: topo em degradê que sangra até a borda da tela (atrás do relógio),
 * com a saudação, o período e o cartão de saldo; depois a lista de receitas e
 * despesas, os atalhos e os blocos em coluna.
 * Desktop: título grande, painel largo de métricas e grades de 12 colunas.
 *
 * As preferências da tela inicial (quais blocos aparecem) valem nos dois.
 */
export function DashboardView() {
  useChartPreload();

  const [period, setPeriod] = useState<PeriodValue>(() => monthPeriod(todayISO()));
  const [novoTipo, setNovoTipo] = useState<"expense" | "income" | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const { preferences } = useDashboardPreferences();
  const { data: user } = useProfile();

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

  function novaTransacao(tipo: "expense" | "income" | null) {
    setNovoTipo(tipo);
    setFormAberto(true);
  }

  const showPrimaryAnalytics = preferences.cashflow || preferences.categories;
  const showSecondaryAnalytics = preferences.transactions || preferences.goals;
  const hasVisibleSection = preferences.summary || showPrimaryAnalytics || showSecondaryAnalytics;
  const primeiroNome = user?.name?.split(" ")[0];

  return (
    <div>
      {/*
       * Topo do celular: cartão em degradê, arredondado nos quatro cantos,
       * que sobe por trás do cabeçalho. Fica fora do bloco escalonado de
       * propósito — deslocá-lo na entrada abriria um vão no alto da tela.
       */}
      <section className="bleed-top brand-gradient relative rounded-[34px] pb-2 shadow-[0_24px_60px_-30px_rgba(255,106,26,0.55)] lg:hidden">
        <div className="mx-auto w-full max-w-md px-2 pb-2 sm:max-w-2xl sm:px-4 md:max-w-3xl">
          <h1 className="text-[2.1rem] leading-[1.1] tracking-[-0.035em]">
            <span className="block font-normal">Olá,</span>
            <span className="block font-bold">{primeiroNome ? `${primeiroNome}!` : "bem-vindo!"}</span>
          </h1>

          <PeriodPicker
            mode="advanced"
            value={period}
            onChange={setPeriod}
            className="mt-4 border-transparent bg-[#0B0B0B]/90 text-white hover:border-transparent hover:bg-[#0B0B0B]"
          />

          {preferences.summary ? (
            <div className="mt-4">
              <BalanceCard summary={data?.summary} />
            </div>
          ) : null}
        </div>
      </section>

      <div className="stagger mt-4 space-y-4 lg:mt-0 lg:space-y-5">
        <PageHeader
          className="hidden lg:flex"
          title={
            <>
              Olá, <span className="font-semibold">{primeiroNome ?? "bem-vindo"}</span>
            </>
          }
          subtitle="Visão geral das suas finanças"
          actions={
            <>
              <PeriodPicker mode="advanced" value={period} onChange={setPeriod} />
              <Button asChild variant="outline" size="icon" aria-label="Personalizar tela inicial">
                <Link href="/app/configuracoes?tab=preferencias">
                  <SlidersHorizontal />
                </Link>
              </Button>
              <Button variant="gradient" onClick={() => novaTransacao(null)}>
                <Plus />
                Nova transação
              </Button>
            </>
          }
        />

        {isError ? (
          <Card>
            <ErrorState
              description="Não conseguimos carregar seus dados agora."
              onRetry={() => void refetch()}
            />
          </Card>
        ) : null}

        {preferences.summary ? (
          <>
            <div className="lg:hidden">
              <SummaryList summary={data?.summary} />
            </div>
            <div className="hidden lg:block">
              {data ? (
                <DesktopSummary summary={data.summary} onNew={() => novaTransacao(null)} />
              ) : isPending ? (
                <DesktopSummarySkeleton />
              ) : null}
            </div>
          </>
        ) : null}

        <div className="lg:hidden">
          <QuickActions onAdd={novaTransacao} />
        </div>

        {showPrimaryAnalytics ? (
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
            {preferences.categories ? (
              <Card className={cn("lg:order-2", preferences.cashflow ? "lg:col-span-4" : "lg:col-span-12")}>
                <CardHeader>
                  <CardTitle>Gastos por categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {isPending ? <ChartSkeleton className="p-0" /> : null}
                  {data ? <CategoryBars distribution={data.category_expenses} /> : null}
                </CardContent>
              </Card>
            ) : null}

            {preferences.cashflow ? (
              <Card className={cn("lg:order-1", preferences.categories ? "lg:col-span-8" : "lg:col-span-12")}>
                <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                  <CardTitle>Fluxo de caixa</CardTitle>
                  <CashflowLegend />
                </CardHeader>
                <CardContent>
                  {isPending ? <ChartSkeleton className="p-0" /> : null}
                  {data ? <CashflowChart data={data.cashflow} /> : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        {showSecondaryAnalytics ? (
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
            {preferences.transactions ? (
              <Card className={preferences.goals ? "lg:col-span-8" : "lg:col-span-12"}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>Transações recentes</CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/app/transacoes">Ver todas</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isPending ? <RowsSkeleton className="p-0" rows={5} /> : null}
                  {data ? <RecentTransactions items={data.recent_transactions} /> : null}
                </CardContent>
              </Card>
            ) : null}

            {preferences.goals ? (
              <Card className={preferences.transactions ? "lg:col-span-4" : "lg:col-span-12"}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle>Metas</CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/app/metas">Ver todas</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isPending ? <RowsSkeleton className="p-0" rows={3} /> : null}
                  {data ? <GoalsSummary goals={data.goals} /> : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

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

      <TransactionFormDialog
        open={formAberto}
        onOpenChange={setFormAberto}
        defaultType={novoTipo ?? undefined}
      />
    </div>
  );
}
