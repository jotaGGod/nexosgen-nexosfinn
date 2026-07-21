"use client";

import { Target } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/states";
import { formatPercentage } from "@/lib/format";
import type { GoalSummary } from "@/types/api";

/** Metas em andamento com barra de progresso, no card lateral do dashboard. */
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
    <ul className="space-y-5">
      {goals.map((goal) => (
        <li key={goal.id} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-medium text-foreground">{goal.name}</p>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatPercentage(goal.percentage, 0)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{goal.current_amount.formatted}</span> de{" "}
            {goal.target_amount.formatted}
          </p>

          <Progress
            value={goal.percentage}
            color={`linear-gradient(90deg, ${goal.color} 0%, ${goal.color}CC 100%)`}
          />
        </li>
      ))}
    </ul>
  );
}
