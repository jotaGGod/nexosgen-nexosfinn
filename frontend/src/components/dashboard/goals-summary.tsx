"use client";

import { Target } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/states";
import { formatPercentage } from "@/lib/format";
import type { GoalSummary } from "@/types/api";

/**
 * Metas em andamento, no formato das referências: nome, régua 0% · atual ·
 * 100% e a barra grossa em degradê da marca, com guardado e alvo embaixo.
 */
export function GoalsSummary({ goals }: { goals: GoalSummary[] }) {
  if (goals.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Nenhuma meta definida"
        description="Crie uma meta para acompanhar o quanto falta para alcançá-la."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {goals.map((goal) => {
        const pct = Math.min(Math.max(goal.percentage, 0), 100);
        return (
          <li key={goal.id} className="rounded-3xl border border-border/70 bg-secondary/40 p-4">
            <p className="truncate text-sm font-semibold text-foreground">{goal.name}</p>

            <div className="relative mt-3 h-4 text-[10px] tabular-nums text-muted-foreground">
              <span className="absolute left-0">0%</span>
              <span
                className="absolute -translate-x-1/2 font-semibold text-foreground"
                style={{ left: `${Math.min(Math.max(pct, 8), 88)}%` }}
              >
                {formatPercentage(goal.percentage, 0)}
              </span>
              <span className="absolute right-0">100%</span>
            </div>
            <Progress value={goal.percentage} size="lg" className="mt-1.5" />

            <div className="mt-3 flex items-end justify-between gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Guardado</p>
                <p className="mt-0.5 font-semibold tabular-nums text-foreground">{goal.current_amount.formatted}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Meta</p>
                <p className="mt-0.5 font-semibold tabular-nums text-foreground">{goal.target_amount.formatted}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
