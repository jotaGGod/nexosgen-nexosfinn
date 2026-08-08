"use client";

import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Variation } from "@/components/common/variation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/api";

interface SummaryCardProps {
  label: string;
  value: string;
  variation: number;
  icon: LucideIcon;
  tint: string;
  invertVariation?: boolean;
  /** O saldo total é o número focal da tela: maior e com um halo de marca. */
  hero?: boolean;
  className?: string;
}

function SummaryCard({ label, value, variation, icon: Icon, tint, invertVariation, hero, className }: SummaryCardProps) {
  return (
    <Card className={cn("relative overflow-hidden p-5", hero && "p-6", className)}>
      {hero ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-primary/10 blur-3xl"
        />
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex items-center justify-center rounded-xl", hero ? "size-10" : "size-9", tint)}>
          <Icon className={hero ? "size-5" : "size-[18px]"} />
        </span>
      </div>
      <p
        className={cn(
          "relative mt-3 font-semibold tracking-tight tabular-nums",
          hero ? "text-[1.75rem] leading-none sm:text-4xl" : "text-2xl",
        )}
      >
        {value}
      </p>
      <Variation className="relative mt-2" value={variation} invert={invertVariation} label="vs mês anterior" />
    </Card>
  );
}

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      <SummaryCard
        label="Saldo Total"
        value={summary.total_balance.formatted}
        variation={summary.total_balance.variation}
        icon={Wallet}
        tint="bg-active/12 text-active"
        hero
        className="col-span-2 md:col-span-3 lg:col-span-2"
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
        className="col-span-2 md:col-span-1"
      />
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          className={cn(
            "space-y-3 p-5",
            index === 0 && "col-span-2 md:col-span-3 lg:col-span-2",
            index === 3 && "col-span-2 md:col-span-1",
          )}
        >
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
