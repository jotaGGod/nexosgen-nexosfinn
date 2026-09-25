"use client";

import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { BarraAnimada } from "@/components/dashboard/chart-bar";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { TrendPoint } from "@/types/api";

/** Tooltip com o valor do mês formatado em reais. */
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-popover px-3.5 py-2.5 shadow-lg">
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
    <div className="h-[240px] w-full lg:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="4 6" stroke="var(--chart-grid)" vertical={false} />
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
          <Tooltip content={<TrendTooltip />} cursor={{ fill: "var(--chart-hover)", radius: 12 } as never} />
          <Bar
            dataKey="income"
            name="Receitas"
            fill="var(--chart-income)"
            maxBarSize={34}
            shape={<BarraAnimada />}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
