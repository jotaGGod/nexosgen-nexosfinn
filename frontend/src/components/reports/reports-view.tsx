"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  Flame,
  Receipt,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { PeriodPicker, monthPeriod, type PeriodValue } from "@/components/common/period-picker";
import { Variation } from "@/components/common/variation";
import {
  CashflowChart,
  CashflowLegend,
  CategoryDonut,
  IncomeBarChart,
  useChartPreload,
} from "@/components/dashboard/lazy-charts";
import { CategoryBars } from "@/components/dashboard/category-bars";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/use-nexosgen-nexosfinn";
import { formatCompactCurrency, formatCurrency, formatDate, formatPercentage, todayISO } from "@/lib/format";
import type { Report } from "@/types/api";

/** Card de métrica da aba "Visão Geral". */
function OverviewCard({
  label,
  value,
  variation,
  invert,
}: {
  label: string;
  value: string;
  variation: number;
  invert?: boolean;
}) {
  return (
    <Card className="mobile-report-metric p-5 lg:p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 truncate text-2xl font-medium tracking-[-0.03em] tabular-nums lg:text-[1.75rem]">{value}</p>
      <Variation className="mt-2" value={variation} invert={invert} />
    </Card>
  );
}

/** Card de insight do período. */
function InsightCard({
  icon: Icon,
  label,
  title,
  detail,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  detail: string;
  tint: string;
}) {
  return (
    <Card className="mobile-insight flex items-start gap-3 p-5">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tint}`}>
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
    </Card>
  );
}

function Insights({ insights }: { insights: Report["insights"] }) {
  const hasAny =
    insights.biggest_expense || insights.smallest_expense || insights.trending_category || insights.best_day;

  if (!hasAny) {
    return (
      <EmptyState
        title="Sem insights para o período"
        description="Os destaques aparecem assim que houver movimentação registrada."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {insights.biggest_expense ? (
        <InsightCard
          icon={ArrowUpRight}
          tint="bg-negative/12 text-negative"
          label="Maior gasto"
          title={insights.biggest_expense.description}
          detail={`${insights.biggest_expense.amount.formatted} · ${formatDate(insights.biggest_expense.date)}`}
        />
      ) : null}

      {insights.smallest_expense ? (
        <InsightCard
          icon={ArrowDownRight}
          tint="bg-positive/12 text-positive"
          label="Menor gasto"
          title={insights.smallest_expense.description}
          detail={`${insights.smallest_expense.amount.formatted} · ${formatDate(insights.smallest_expense.date)}`}
        />
      ) : null}

      {insights.trending_category ? (
        <InsightCard
          icon={Flame}
          tint="bg-[hsl(38_92%_55%/0.12)] text-[hsl(38_92%_55%)]"
          label="Categoria em alta"
          title={insights.trending_category.category.name || "Sem categoria"}
          detail={`${insights.trending_category.current.formatted} · ${formatPercentage(
            insights.trending_category.variation,
          )} vs período anterior`}
        />
      ) : null}

      {insights.best_day ? (
        <InsightCard
          icon={CalendarCheck}
          tint="bg-active/12 text-active"
          label="Melhor dia"
          title={formatDate(insights.best_day.date)}
          detail={`Saldo de ${insights.best_day.net.formatted}`}
        />
      ) : null}
    </div>
  );
}

/** Tela de relatórios, com as quatro abas do layout de referência. */
export function ReportsView() {
  useChartPreload();

  const [period, setPeriod] = useState<PeriodValue>(() => monthPeriod(todayISO()));

  const { data, isPending, isError, refetch } = useReport({
    start_date: period.start,
    end_date: period.end,
    trend_months: 6,
  });

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="Análises"
        subtitle="Análises detalhadas das suas finanças"
        actions={<PeriodPicker value={period} onChange={setPeriod} />}
      />

      {isError ? (
        <Card>
          <ErrorState onRetry={() => void refetch()} />
        </Card>
      ) : null}

      {isPending && !isError ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="space-y-3 p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-3 w-28" />
              </Card>
            ))}
          </div>
          <Card>
            <ChartSkeleton />
          </Card>
        </div>
      ) : null}

      {data ? (
        <Tabs defaultValue="overview">
          <TabsList className="mobile-report-tabs">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              <OverviewCard
                label="Receitas Totais"
                value={data.overview.total_income.formatted}
                variation={data.overview.total_income.variation}
              />
              <OverviewCard
                label="Despesas Totais"
                value={data.overview.total_expense.formatted}
                variation={data.overview.total_expense.variation}
                invert
              />
              <OverviewCard
                label="Ticket Médio"
                value={data.overview.average_ticket.formatted}
                variation={data.overview.average_ticket.variation}
                invert
              />
              <OverviewCard
                label="Transações"
                value={String(Math.round(data.overview.transaction_count.value))}
                variation={data.overview.transaction_count.variation}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução das Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <IncomeBarChart data={data.trends} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryBars distribution={data.category_expenses} limit={6} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Insights do Período</h2>
              <Insights insights={data.insights} />
            </div>
          </TabsContent>

          <TabsContent value="cashflow">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>Fluxo de Caixa</CardTitle>
                <CashflowLegend />
              </CardHeader>
              <CardContent>
                <CashflowChart data={data.cashflow} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryDonut distribution={data.category_expenses} legendLimit={8} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryDonut distribution={data.category_incomes} legendLimit={8} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Poupança por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="mobile-trends w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-border/70 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <th scope="col" className="py-3 pr-4">Mês</th>
                        <th scope="col" className="py-3 pr-4 text-right">Receitas</th>
                        <th scope="col" className="py-3 pr-4 text-right">Despesas</th>
                        <th scope="col" className="py-3 pr-4 text-right">Saldo</th>
                        <th scope="col" className="py-3 text-right">Poupança</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {data.trends.map((point) => (
                        <tr key={point.month} className="transition-colors hover:bg-secondary/50">
                          <td className="py-3 pr-4 font-medium">{point.label}</td>
                          <td data-label="Receitas" className="py-3 pr-4 text-right tabular-nums text-positive">
                            {formatCurrency(point.income)}
                          </td>
                          <td data-label="Despesas" className="py-3 pr-4 text-right tabular-nums text-negative">
                            {formatCurrency(point.expense)}
                          </td>
                          <td data-label="Saldo" className="py-3 pr-4 text-right font-medium tabular-nums">
                            {formatCurrency(point.net)}
                          </td>
                          <td data-label="Poupança" className="py-3 text-right tabular-nums">
                            {formatPercentage(point.savings_rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
