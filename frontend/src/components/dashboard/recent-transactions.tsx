"use client";

import { ArrowLeftRight } from "lucide-react";

import { IconBadge } from "@/components/common/icon-badge";
import { EmptyState } from "@/components/ui/states";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/api";

/** Lista compacta dos últimos lançamentos, como no card da referência. */
export function RecentTransactions({ items }: { items: Transaction[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Nenhuma transação ainda"
        description="Registre seu primeiro lançamento para acompanhar a movimentação."
      />
    );
  }

  return (
    <ul className="divide-y divide-border/70">
      {items.map((transaction) => {
        const income = transaction.type === "income";

        return (
          <li key={transaction.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <IconBadge icon={transaction.category.icon} color={transaction.category.color} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{transaction.description}</p>
              <p className="truncate text-xs text-muted-foreground">{transaction.category.name}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className={cn("text-sm font-semibold tabular-nums", income ? "text-emerald-400" : "text-red-400")}>
                {income ? "" : "-"}
                {transaction.amount.formatted}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelativeDate(transaction.date)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
