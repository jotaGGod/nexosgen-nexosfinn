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
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PeriodPicker, monthPeriod, type PeriodValue } from "@/components/common/period-picker";
import { Variation } from "@/components/common/variation";
import { CashflowChart, CashflowLegend } from "@/components/dashboard/cashflow-chart";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useReport } from "@/hooks/use-finapp";
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
    <Card className="p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
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
    <Card className="flex items-start gap-3 p-4">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tint}`}>
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

/** Tooltip do gráfico de barras da evolução de receitas. */
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-xs text-muted-foreground">
          {entry.name}: <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {insights.biggest_expense ? (
        <InsightCard
          icon={ArrowUpRight}
          tint="bg-red-500/15 text-red-400"
          label="Maior gasto"
          title={insights.biggest_expense.description}
          detail={`${insights.biggest_expense.amount.formatted} · ${formatDate(insights.biggest_expense.date)}`}
        />
      ) : null}

      {insights.smallest_expense ? (
        <InsightCard
          icon={ArrowDownRight}
          tint="bg-emerald-500/15 text-emerald-400"
          label="Menor gasto"
          title={insights.smallest_expense.description}
          detail={`${insights.smallest_expense.amount.formatted} · ${formatDate(insights.smallest_expense.date)}`}
        />
      ) : null}

      {insights.trending_category ? (
        <InsightCard
          icon={Flame}
          tint="bg-amber-500/15 text-amber-400"
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
          tint="bg-violet-500/15 text-violet-400"
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
  const [period, setPeriod] = useState<PeriodValue>(() => monthPeriod(todayISO()));

  const { data, isPending, isError, refetch } = useReport({
    start_date: period.start,
    end_date: period.end,
    trend_months: 6,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução das Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.trends} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke="hsl(var(--border))"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          dy={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          tickFormatter={formatCompactCurrency}
                          width={70}
                        />
                        <Tooltip content={<TrendTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                        <Bar dataKey="income" name="Receitas" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryDonut distribution={data.category_expenses} />
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

          <TabsContent value="categories" className="grid gap-4 lg:grid-cols-2">
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
                  <table className="w-full min-w-[520px] text-sm">
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
                        <tr key={point.month}>
                          <td className="py-3 pr-4 font-medium">{point.label}</td>
                          <td className="py-3 pr-4 text-right tabular-nums text-emerald-400">
                            {formatCurrency(point.income)}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums text-red-400">
                            {formatCurrency(point.expense)}
                          </td>
                          <td className="py-3 pr-4 text-right font-medium tabular-nums">
                            {formatCurrency(point.net)}
                          </td>
                          <td className="py-3 text-right tabular-nums">
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
