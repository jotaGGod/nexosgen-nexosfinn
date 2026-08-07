"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth as endOfCalendarMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth as startOfCalendarMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  endOfMonth,
  formatMonthLabel,
  formatPeriodLabel,
  shiftDays,
  startOfMonth,
  todayISO,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PeriodValue {
  start: string;
  end: string;
}

type PickerMode = "today" | "week" | "monthly" | "yearly" | "custom";

interface PeriodPickerProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
  mode?: "advanced" | "month";
  className?: string;
}

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const modeOptions: Array<{ value: PickerMode; label: string }> = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Últimos 7 dias" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
  { value: "custom", label: "Personalizado" },
];

/** Retorna o período do mês que contém a data informada. */
export function monthPeriod(isoDate: string): PeriodValue {
  return { start: startOfMonth(isoDate), end: endOfMonth(isoDate) };
}

function yearPeriod(year: number): PeriodValue {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

function periodLabel(period: PeriodValue) {
  const today = todayISO();
  if (period.start === today && period.end === today) return "Hoje";
  if (period.start === shiftDays(today, -6) && period.end === today) return "Últimos 7 dias";
  if (period.start === startOfMonth(period.start) && period.end === endOfMonth(period.start)) {
    return formatMonthLabel(period.start);
  }
  if (period.start.endsWith("-01-01") && period.end === `${period.start.slice(0, 4)}-12-31`) {
    return `Ano de ${period.start.slice(0, 4)}`;
  }
  return formatPeriodLabel(period.start, period.end);
}

function MonthGrid({
  year,
  selected,
  onYearChange,
  onSelect,
}: {
  year: number;
  selected: PeriodValue;
  onYearChange: (year: number) => void;
  onSelect: (month: number) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => onYearChange(year - 1)}>
          <ChevronLeft />
          <span className="sr-only">Ano anterior</span>
        </Button>
        <p className="text-sm font-semibold tabular-nums">{year}</p>
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => onYearChange(year + 1)}>
          <ChevronRight />
          <span className="sr-only">Próximo ano</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {months.map((label, index) => {
          const month = String(index + 1).padStart(2, "0");
          const isSelected = selected.start.startsWith(`${year}-${month}`) && selected.end.startsWith(`${year}-${month}`);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "min-h-11 rounded-xl border border-transparent px-2 text-sm font-medium transition-colors hover:border-border hover:bg-secondary",
                isSelected && "border-active/20 bg-active text-active-foreground hover:bg-active/90",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YearGrid({
  referenceYear,
  selected,
  onReferenceYearChange,
  onSelect,
}: {
  referenceYear: number;
  selected: PeriodValue;
  onReferenceYearChange: (year: number) => void;
  onSelect: (year: number) => void;
}) {
  const years = Array.from({ length: 12 }, (_, index) => referenceYear - 5 + index);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => onReferenceYearChange(referenceYear - 12)}>
          <ChevronLeft />
          <span className="sr-only">Anos anteriores</span>
        </Button>
        <p className="text-sm font-semibold tabular-nums">
          {years[0]}–{years[years.length - 1]}
        </p>
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => onReferenceYearChange(referenceYear + 12)}>
          <ChevronRight />
          <span className="sr-only">Próximos anos</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => {
          const isSelected = selected.start === `${year}-01-01` && selected.end === `${year}-12-31`;
          return (
            <button
              key={year}
              type="button"
              onClick={() => onSelect(year)}
              className={cn(
                "min-h-11 rounded-xl border border-transparent px-2 text-sm font-medium tabular-nums transition-colors hover:border-border hover:bg-secondary",
                isSelected && "border-active/20 bg-active text-active-foreground hover:bg-active/90",
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeCalendar({
  viewMonth,
  selected,
  draftStart,
  onViewMonthChange,
  onSelectDay,
}: {
  viewMonth: Date;
  selected: PeriodValue;
  draftStart: string | null;
  onViewMonthChange: (date: Date) => void;
  onSelectDay: (isoDate: string) => void;
}) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfCalendarMonth(viewMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfCalendarMonth(viewMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const shownYear = viewMonth.getFullYear();
  const yearOptions = Array.from({ length: 81 }, (_, index) => shownYear - 40 + index);
  const previewStart = draftStart ?? selected.start;
  const previewEnd = draftStart ? null : selected.end;

  return (
    <div className="min-w-0">
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        {draftStart ? "Agora escolha a data final." : "Escolha a data inicial e depois a final."}
      </p>

      <div className="mb-3 flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => onViewMonthChange(addMonths(viewMonth, -1))}>
          <ChevronLeft />
          <span className="sr-only">Mês anterior</span>
        </Button>

        <label className="sr-only" htmlFor="calendar-month">Mês</label>
        <select
          id="calendar-month"
          value={viewMonth.getMonth()}
          onChange={(event) => onViewMonthChange(new Date(shownYear, Number(event.target.value), 1))}
          className="h-9 min-w-0 flex-1 rounded-xl border border-input bg-card px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
        >
          {months.map((month, index) => <option key={month} value={index}>{month}</option>)}
        </select>

        <label className="sr-only" htmlFor="calendar-year">Ano</label>
        <select
          id="calendar-year"
          value={shownYear}
          onChange={(event) => onViewMonthChange(new Date(Number(event.target.value), viewMonth.getMonth(), 1))}
          className="h-9 w-24 rounded-xl border border-input bg-card px-2 text-sm font-medium tabular-nums outline-none focus:ring-2 focus:ring-ring"
        >
          {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>

        <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}>
          <ChevronRight />
          <span className="sr-only">Próximo mês</span>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1" aria-label="Calendário do período personalizado">
        {weekdays.map((day) => (
          <span key={day} className="py-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
            {day}
          </span>
        ))}
        {days.map((day) => {
          const isoDate = format(day, "yyyy-MM-dd");
          const isOutside = !isSameMonth(day, viewMonth);
          const isBoundary = isoDate === previewStart || isoDate === previewEnd;
          const isInRange = Boolean(previewEnd && isoDate > previewStart && isoDate < previewEnd);
          return (
            <button
              key={isoDate}
              type="button"
              onClick={() => onSelectDay(isoDate)}
              className={cn(
                "flex aspect-square min-h-11 items-center justify-center rounded-xl text-xs tabular-nums transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isOutside && "text-muted-foreground/45",
                isInRange && "rounded-none bg-active/10 text-active",
                isBoundary && "bg-active font-semibold text-active-foreground hover:bg-active/90",
              )}
            >
              {format(day, "d", { locale: ptBR })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Seletor mensal simples ou painel completo de intervalo para o Dashboard. */
export function PeriodPicker({ value, onChange, mode = "month", className }: PeriodPickerProps) {
  const [open, setOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>("monthly");
  const [referenceYear, setReferenceYear] = useState(() => Number(value.start.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => startOfCalendarMonth(parseISO(value.start)));
  const [draftStart, setDraftStart] = useState<string | null>(null);

  function apply(next: PeriodValue) {
    onChange(next);
    setDraftStart(null);
    setOpen(false);
  }

  function selectMode(nextMode: PickerMode) {
    setPickerMode(nextMode);
    setDraftStart(null);
    if (nextMode === "today") {
      const today = todayISO();
      apply({ start: today, end: today });
    }
    if (nextMode === "week") {
      const today = todayISO();
      apply({ start: shiftDays(today, -6), end: today });
    }
  }

  function selectMonth(month: number) {
    const isoDate = `${referenceYear}-${String(month + 1).padStart(2, "0")}-01`;
    apply(monthPeriod(isoDate));
  }

  function selectCustomDay(isoDate: string) {
    if (!draftStart) {
      setDraftStart(isoDate);
      return;
    }
    apply(isoDate < draftStart ? { start: isoDate, end: draftStart } : { start: draftStart, end: isoDate });
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setReferenceYear(Number(value.start.slice(0, 4)));
          setViewMonth(startOfCalendarMonth(parseISO(value.start)));
          setDraftStart(null);
          if (mode === "month" || pickerMode === "today" || pickerMode === "week") {
            setPickerMode("monthly");
          }
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-input bg-card px-4 text-sm font-semibold shadow-sm outline-none transition-colors hover:border-active/30 hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring sm:w-auto",
            className,
          )}
          aria-label={`Filtrar período: ${periodLabel(value)}`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-active" />
            <span className="truncate tabular-nums">{periodLabel(value)}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        collisionPadding={16}
        className={cn(
          "max-h-[min(78vh,620px)] max-w-[calc(100vw-2rem)] overflow-y-auto p-0",
          mode === "advanced" ? "w-[640px]" : "w-[360px]",
        )}
      >
        <div className={cn(mode === "advanced" && "sm:flex")}>
          {mode === "advanced" ? (
            <div className="grid grid-cols-2 gap-1 border-b border-border p-3 sm:w-44 sm:shrink-0 sm:grid-cols-1 sm:border-b-0 sm:border-r">
              {modeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectMode(option.value)}
                  className={cn(
                    "min-h-11 rounded-xl px-3 text-left text-sm font-medium transition-colors hover:bg-secondary",
                    pickerMode === option.value && "bg-active/10 text-active",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="min-w-0 flex-1 p-4">
            {pickerMode === "monthly" ? (
              <MonthGrid
                year={referenceYear}
                selected={value}
                onYearChange={setReferenceYear}
                onSelect={selectMonth}
              />
            ) : null}
            {pickerMode === "yearly" ? (
              <YearGrid
                referenceYear={referenceYear}
                selected={value}
                onReferenceYearChange={setReferenceYear}
                onSelect={(year) => apply(yearPeriod(year))}
              />
            ) : null}
            {pickerMode === "custom" ? (
              <RangeCalendar
                viewMonth={viewMonth}
                selected={value}
                draftStart={draftStart}
                onViewMonthChange={setViewMonth}
                onSelectDay={selectCustomDay}
              />
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
