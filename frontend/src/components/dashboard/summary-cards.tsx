"use client";

import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Variation } from "@/components/common/variation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@/types/api";

interface SummaryCardProps {
  label: string;
  value: string;
  variation: number;
  icon: LucideIcon;
  tint: string;
  invertVariation?: boolean;
}

function SummaryCard({ label, value, variation, icon: Icon, tint, invertVariation }: SummaryCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <Variation className="mt-2" value={variation} invert={invertVariation} label="vs mês anterior" />
    </Card>
  );
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <SummaryCard
        label="Saldo Total"
        value={summary.total_balance.formatted}
        variation={summary.total_balance.variation}
        icon={Wallet}
        tint="bg-primary/12 text-primary"
      />
      <SummaryCard
        label="Receitas"
        value={summary.income.formatted}
        variation={summary.income.variation}
        icon={ArrowUpCircle}
        tint="bg-positive/12 text-positive"
      />
      <SummaryCard
        label="Despesas"
        value={summary.expense.formatted}
        variation={summary.expense.variation}
        icon={ArrowDownCircle}
        tint="bg-negative/12 text-negative"
        invertVariation
      />
      <SummaryCard
        label="Economia"
        value={summary.savings.formatted}
        variation={summary.savings.variation}
        icon={PiggyBank}
        tint="bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
      />
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="space-y-3 p-5">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}
