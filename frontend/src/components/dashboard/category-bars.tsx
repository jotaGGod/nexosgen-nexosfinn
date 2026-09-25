"use client";

import { EmptyState } from "@/components/ui/states";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryDistribution } from "@/types/api";

interface CategoryBarsProps {
  distribution: CategoryDistribution;
  /** Quantidade de colunas; o restante é somado em "Outras". */
  limit?: number;
  className?: string;
}

/**
 * Distribuição por categoria em colunas verticais.
 *
 * Cada categoria é um trilho arredondado com o percentual no alto e o
 * preenchimento na cor da própria categoria, crescendo da base — a leitura
 * de "informe financeiro" das referências. Feito em HTML puro, sem Recharts:
 * são poucas colunas estáticas, e assim o bloco entra no pacote principal
 * sem custo e aparece junto com os dados.
 *
 * A altura do preenchimento é o percentual real sobre o trilho inteiro, então
 * 40% ocupa 40% da coluna — a comparação entre colunas é honesta.
 */
export function CategoryBars({ distribution, limit = 5, className }: CategoryBarsProps) {
  if (distribution.slices.length === 0) {
    return (
      <EmptyState
        title="Nenhuma despesa no período"
        description="Registre lançamentos para ver como seus gastos se distribuem."
      />
    );
  }

  const principais = distribution.slices.slice(0, limit);
  const resto = distribution.slices.slice(limit);
  const colunas = [...principais];

  if (resto.length > 0) {
    const percentual = resto.reduce((soma, fatia) => soma + fatia.percentage, 0);
    const valor = resto.reduce((soma, fatia) => soma + fatia.total.amount, 0);
    colunas.push({
      category_id: "outras",
      name: "Outras",
      color: "hsl(var(--muted-foreground))",
      icon: "tag",
      total: { amount: valor, formatted: formatCurrency(valor) },
      percentage: percentual,
      count: resto.reduce((soma, fatia) => soma + fatia.count, 0),
    });
  }

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex h-44 items-end gap-2 sm:gap-2.5">
        {colunas.map((fatia, indice) => (
          <div
            key={fatia.category_id}
            className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-[var(--chart-track)] sm:rounded-[20px]"
            title={`${fatia.name}: ${fatia.total.formatted} · ${formatPercentage(fatia.percentage, 0)}`}
          >
            <span className="relative z-10 pt-2.5 text-center text-[11px] font-medium tabular-nums text-muted-foreground">
              {formatPercentage(fatia.percentage, 0)}
            </span>
            <span
              className="grow-y absolute inset-x-0 bottom-0 rounded-[16px] sm:rounded-[18px]"
              style={{
                height: `${Math.max(fatia.percentage, 2.5)}%`,
                background: fatia.color,
                animationDelay: `${indice * 70}ms`,
              }}
            />
          </div>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {colunas.map((fatia) => (
          <li key={fatia.category_id} className="flex min-w-0 items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-[4px]" style={{ background: fatia.color }} />
            <span className="min-w-0 flex-1 truncate text-foreground/90">{fatia.name}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{fatia.total.formatted}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
