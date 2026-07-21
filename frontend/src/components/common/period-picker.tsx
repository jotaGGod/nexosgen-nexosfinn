"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { endOfMonth, formatPeriodLabel, startOfMonth } from "@/lib/format";

export interface PeriodValue {
  start: string;
  end: string;
}

interface PeriodPickerProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

/** Retorna o período do mês que contém a data informada. */
export function monthPeriod(isoDate: string): PeriodValue {
  return { start: startOfMonth(isoDate), end: endOfMonth(isoDate) };
}

/** Desloca o período em N meses. */
function shiftMonths(period: PeriodValue, months: number): PeriodValue {
  const reference = new Date(`${period.start}T00:00:00Z`);
  reference.setUTCMonth(reference.getUTCMonth() + months);
  return monthPeriod(reference.toISOString().slice(0, 10));
}

/**
 * Seletor de período por mês.
 *
 * Cobre o caso dominante (olhar um mês por vez) com dois cliques, em vez de
 * exigir um calendário de intervalo para a navegação mais comum.
 */
export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onChange(shiftMonths(value, -1))}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <span className="flex items-center gap-2 px-2 text-sm font-medium tabular-nums">
        <CalendarDays className="size-4 text-muted-foreground" />
        {formatPeriodLabel(value.start, value.end)}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onChange(shiftMonths(value, 1))}
        aria-label="Próximo mês"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
