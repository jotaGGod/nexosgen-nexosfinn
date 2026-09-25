"use client";

import { memo } from "react";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { BarraAnimada } from "@/components/dashboard/chart-bar";
import { EmptyState } from "@/components/ui/states";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { CashflowPoint } from "@/types/api";

const INCOME_COLOR = "var(--chart-income)";
const EXPENSE_COLOR = "var(--chart-neutral)";
const GRID_COLOR = "var(--chart-grid)";
const MUTED_COLOR = "var(--chart-muted)";

/** Tooltip com os dois valores do mês, formatados em reais. */
function CashflowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-popover px-3.5 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: entry.fill }} />
          {entry.name}
          <span className="ml-auto pl-4 font-medium tabular-nums text-foreground">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Fluxo de caixa mensal em barras: receitas (laranja) ao lado das despesas
 * (neutro), mês a mês.
 *
 * A série já vem do backend com os meses sem movimento zerados, então nenhuma
 * coluna some do eixo.
 */
export const CashflowChart = memo(function CashflowChart({ data }: { data: CashflowPoint[] }) {
  const hasMovement = data.some((point) => point.income > 0 || point.expense > 0);

  if (!hasMovement) {
    return (
      <EmptyState
        title="Sem movimentação no período"
        description="Assim que você registrar receitas ou despesas, a evolução aparece aqui."
      />
    );
  }

  return (
    <div className="h-[260px] w-full lg:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }} barGap={4} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="4 6" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: MUTED_COLOR, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: MUTED_COLOR, fontSize: 12 }}
            tickFormatter={formatCompactCurrency}
            width={70}
          />
          <Tooltip content={<CashflowTooltip />} cursor={{ fill: "var(--chart-hover)", radius: 12 } as never} />
          <Bar
            dataKey="income"
            name="Receitas"
            fill={INCOME_COLOR}
            maxBarSize={22}
            shape={<BarraAnimada />}
            isAnimationActive={false}
          />
          <Bar
            dataKey="expense"
            name="Despesas"
            fill={EXPENSE_COLOR}
            maxBarSize={22}
            shape={<BarraAnimada />}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
