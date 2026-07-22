"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/states";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { CashflowPoint } from "@/types/api";

const INCOME_COLOR = "#7C3AED";
const EXPENSE_COLOR = "#EC4899";
const GRID_COLOR = "hsl(var(--border))";
const MUTED_COLOR = "hsl(var(--muted-foreground))";

/** Tooltip com os dois valores do mês, formatados em reais. */
function CashflowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
          {entry.name}
          <span className="ml-auto font-medium tabular-nums text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

/**
 * Fluxo de caixa mensal: receitas e despesas em linhas suavizadas.
 *
 * A série já vem do backend com os meses sem movimento zerados, então a linha
 * nunca aparece com buracos.
 */
export function CashflowChart({ data }: { data: CashflowPoint[] }) {
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
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
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
          <Tooltip content={<CashflowTooltip />} cursor={{ stroke: GRID_COLOR, strokeDasharray: "4 4" }} />
          <Line
            type="monotone"
            dataKey="income"
            name="Receitas"
            stroke={INCOME_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Despesas"
            stroke={EXPENSE_COLOR}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Legenda do gráfico, exibida no cabeçalho do card. */
export function CashflowLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ backgroundColor: INCOME_COLOR }} />
        Receitas
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ backgroundColor: EXPENSE_COLOR }} />
        Despesas
      </span>
    </div>
  );
}
