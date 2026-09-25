"use client";

import { ArrowLeftRight } from "lucide-react";

import { IconBadge } from "@/components/common/icon-badge";
import { EmptyState } from "@/components/ui/states";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/api";

/** Lista compacta dos últimos lançamentos, em linhas arredondadas. */
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
    <ul className="-mx-2 space-y-1">
      {items.map((transaction) => {
        const income = transaction.type === "income";

        return (
          <li
            key={transaction.id}
            className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-secondary/60"
          >
            <IconBadge icon={transaction.category.icon} color={transaction.category.color} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{transaction.description}</p>
              <p className="truncate text-xs text-muted-foreground">{transaction.category.name}</p>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  income
                    ? "text-positive"
                    : "text-negative",
                )}
              >
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
