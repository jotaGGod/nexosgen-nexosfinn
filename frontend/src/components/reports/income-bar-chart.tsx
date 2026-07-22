"use client";

import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { TrendPoint } from "@/types/api";

/** Tooltip com o valor do mês formatado em reais. */
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-card">
      <p className="mb-1 text-xs font-semibold">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="text-xs text-muted-foreground">
          {entry.name}: <span className="font-medium text-foreground">{formatCurrency(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Evolução mensal das receitas.
 *
 * Vive em arquivo próprio para que o Recharts saia do pacote inicial da tela
 * de relatórios — ele é carregado sob demanda por lazy-charts.
 *
 * Memoizado porque a tela re-renderiza a cada troca de aba e a cada mudança do
 * seletor de período, enquanto a série em si só muda quando os dados mudam.
 * Sem isso, o gráfico seria redesenhado à toa em interações que não têm nada a
 * ver com ele.
 */
export const IncomeBarChart = memo(function IncomeBarChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            tickFormatter={formatCompactCurrency}
            width={62}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--chart-hover)" }} />
          <Bar
            dataKey="income"
            name="Receitas"
            fill="var(--chart-income)"
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
