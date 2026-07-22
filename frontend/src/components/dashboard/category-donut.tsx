"use client";

import { memo } from "react";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/ui/states";
import { formatPercentage } from "@/lib/format";
import type { CategoryDistribution } from "@/types/api";

/** Tooltip da fatia, com valor e participação. */
function SliceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold">{slice.name}</p>
      <p className="text-xs text-muted-foreground">
        {slice.total.formatted} · {formatPercentage(slice.percentage)}
      </p>
    </div>
  );
}

interface CategoryDonutProps {
  distribution: CategoryDistribution;
  /** Rótulo central do anel. */
  centerLabel?: string;
  /** Quantidade máxima de itens na legenda. */
  legendLimit?: number;
}

/**
 * Distribuição por categoria em anel, com legenda detalhada ao lado.
 *
 * A legenda repete valor e percentual porque, em um donut com muitas fatias,
 * a leitura pelo ângulo sozinha é imprecisa.
 */
export const CategoryDonut = memo(function CategoryDonut({ distribution, centerLabel = "Total", legendLimit = 6 }: CategoryDonutProps) {
  if (distribution.slices.length === 0) {
    return (
      <EmptyState
        title="Nenhuma despesa no período"
        description="Registre lançamentos para ver como seus gastos se distribuem."
      />
    );
  }

  const legend = distribution.slices.slice(0, legendLimit);

  return (
    // flex-wrap em vez de breakpoint fixo: a legenda desce para baixo do anel
    // sempre que a largura do card não comportar as duas colunas, o que
    // acontece tanto no dashboard quanto no mobile.
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution.slices}
              dataKey="percentage"
              nameKey="name"
              innerRadius={62}
              outerRadius={94}
              paddingAngle={2}
              strokeWidth={0}
              // A animação de montagem do Recharts termina removendo os setores
              // nesta combinação de versões, deixando o anel invisível. Ela é
              // puramente decorativa aqui — o donut é redesenhado a cada troca
              // de período, e a transição só atrapalha a leitura.
              isAnimationActive={false}
            >
              {distribution.slices.map((slice) => (
                <Cell key={slice.category_id} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<SliceTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
          <span className="text-lg font-semibold tabular-nums">{distribution.total.formatted}</span>
        </div>
      </div>

      <ul className="min-w-[220px] flex-1 space-y-3">
        {legend.map((slice) => (
          <li key={slice.category_id} className="flex items-center gap-2.5 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
            <span className="min-w-0 flex-1 truncate text-foreground">{slice.name}</span>
            <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {formatPercentage(slice.percentage, 0)}
            </span>
            <span className="shrink-0 whitespace-nowrap text-xs font-medium tabular-nums">
              {slice.total.formatted}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
