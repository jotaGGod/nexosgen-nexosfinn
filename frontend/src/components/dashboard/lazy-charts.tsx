"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { ChartSkeleton } from "@/components/ui/states";

/**
 * Gráficos carregados sob demanda.
 *
 * O Recharts responde por cerca de 150 kB — mais da metade do JavaScript das
 * telas que o usam, e mais do que todo o restante do aplicativo somado. Como
 * os gráficos ficam abaixo da dobra, mantê-los no pacote inicial atrasa a
 * primeira interação por conteúdo que o usuário ainda não vê.
 *
 * Aqui eles viram um pedaço separado, buscado depois que a tela já está de pé.
 * O esqueleto ocupa exatamente a altura final, então a troca não desloca nada.
 *
 * `ssr: false` porque o Recharts mede o contêiner para desenhar: renderizá-lo
 * no servidor produziria um SVG de dimensão zero, descartado na hidratação.
 */

export const CashflowChart = dynamic(
  () => import("@/components/dashboard/cashflow-chart").then((m) => m.CashflowChart),
  { ssr: false, loading: () => <ChartSkeleton className="p-0" /> },
);

export const CategoryDonut = dynamic(
  () => import("@/components/dashboard/category-donut").then((m) => m.CategoryDonut),
  { ssr: false, loading: () => <ChartSkeleton className="p-0" /> },
);

export const IncomeBarChart = dynamic(
  () => import("@/components/reports/income-bar-chart").then((m) => m.IncomeBarChart),
  { ssr: false, loading: () => <ChartSkeleton className="p-0" /> },
);

/**
 * Começa a baixar os gráficos assim que a tela monta.
 *
 * Sem isto, o `import()` só dispara quando o componente renderiza — o que só
 * acontece depois que os dados chegam. As duas esperas ficam em fila: primeiro
 * a requisição da API, depois o pedaço do gráfico, um tempo de ida e volta a
 * mais até a tela ficar completa.
 *
 * Disparando o download aqui, ele corre em paralelo com a busca dos dados e
 * normalmente já terminou quando a resposta chega. O import é o mesmo, então o
 * empacotador reaproveita o resultado em vez de baixar duas vezes — e continua
 * fora do pacote inicial, que era o ponto.
 */
export function useChartPreload() {
  useEffect(() => {
    void import("@/components/dashboard/cashflow-chart");
    void import("@/components/dashboard/category-donut");
    void import("@/components/reports/income-bar-chart");
  }, []);
}

/**
 * Legenda do gráfico de fluxo, exibida no cabeçalho do card.
 *
 * Fica aqui, e não junto do gráfico, justamente porque é carregada de imediato:
 * se viesse do módulo do gráfico, importá-la traria o Recharts junto e anularia
 * o carregamento sob demanda acima.
 */
export function CashflowLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-income)" }} />
        Receitas
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ backgroundColor: "var(--chart-neutral)" }} />
        Despesas
      </span>
    </div>
  );
}
