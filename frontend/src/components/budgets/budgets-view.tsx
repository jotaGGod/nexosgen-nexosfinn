"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Loader2, PieChart, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { IconBadge } from "@/components/common/icon-badge";
import { MoneyInput } from "@/components/common/money-input";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { runMutation, useBudgets, useCategories, useDeleteBudget, useUpsertBudget } from "@/hooks/use-finapp";
import { formatMonthLabel, formatPercentage, startOfMonth, todayISO } from "@/lib/format";
import { budgetSchema, type BudgetValues } from "@/schemas/transaction";
import type { BudgetStatus } from "@/types/api";

/** Cores da barra conforme o estado do orçamento. */
const statusColor: Record<BudgetStatus, string> = {
  ok: "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
  warning: "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
  exceeded: "linear-gradient(90deg, #EF4444 0%, #F87171 100%)",
};

const statusLabel: Record<BudgetStatus, string> = {
  ok: "Dentro do limite",
  warning: "Perto do limite",
  exceeded: "Limite estourado",
};

const statusBadge: Record<BudgetStatus, "income" | "warning" | "expense"> = {
  ok: "income",
  warning: "warning",
  exceeded: "expense",
};

/** Tela de orçamentos: limite por categoria e consumo do mês. */
export function BudgetsView() {
  const [month, setMonth] = useState(() => startOfMonth(todayISO()));
  const [formOpen, setFormOpen] = useState(false);

  const { data, isPending, isError, refetch } = useBudgets(month);
  const { data: categories = [] } = useCategories("expense");
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BudgetValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { category_id: "", limit_amount: 0 },
  });

  function shiftMonth(months: number) {
    const reference = new Date(`${month}T00:00:00Z`);
    reference.setUTCMonth(reference.getUTCMonth() + months);
    setMonth(startOfMonth(reference.toISOString().slice(0, 10)));
  }

  async function onSubmit(values: BudgetValues) {
    const result = await runMutation(upsertBudget, { ...values, month });
    if (!result.ok) return;

    setFormOpen(false);
    reset({ category_id: "", limit_amount: 0 });
  }

  const items = data?.items ?? [];
  // Uma categoria só pode ter um orçamento por mês; as já usadas saem da lista.
  const availableCategories = categories.filter(
    (category) => !items.some((budget) => budget.category.id === category.id),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        subtitle="Defina limites mensais por categoria"
        actions={
          <>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-2 text-sm font-medium">{formatMonthLabel(month)}</span>
              <Button variant="ghost" size="icon" className="size-8" onClick={() => shiftMonth(1)} aria-label="Próximo mês">
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <Button variant="gradient" onClick={() => setFormOpen(true)}>
              <Plus />
              Definir Orçamento
            </Button>
          </>
        }
      />

      {data && items.length > 0 ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Consumo total do mês</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data.total_spent.formatted}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  de {data.total_limit.formatted}
                </span>
              </p>
            </div>
            <span className="text-2xl font-semibold tabular-nums">{formatPercentage(data.percentage, 0)}</span>
          </div>
          <Progress className="mt-4" value={data.percentage} />
        </Card>
      ) : null}

      {isError ? (
        <Card>
          <ErrorState onRetry={() => void refetch()} />
        </Card>
      ) : null}

      {isPending && !isError ? (
        <Card>
          <RowsSkeleton rows={4} />
        </Card>
      ) : null}

      {data && items.length === 0 ? (
        <Card>
          <EmptyState
            icon={PieChart}
            title="Nenhum orçamento neste mês"
            description="Defina um limite por categoria e acompanhe o quanto já foi consumido."
            action={
              <Button variant="gradient" onClick={() => setFormOpen(true)}>
                <Plus />
                Definir Orçamento
              </Button>
            }
          />
        </Card>
      ) : null}

      {items.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((budget) => (
            <Card key={budget.id} className="group p-5">
              <div className="flex items-start gap-3">
                <IconBadge icon={budget.category.icon} color={budget.category.color} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate font-medium">{budget.category.name}</p>
                    <Badge variant={statusBadge[budget.status]}>{statusLabel[budget.status]}</Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{budget.spent.formatted}</span> de{" "}
                    {budget.limit.formatted}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-destructive opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                  onClick={() => void runMutation(deleteBudget, budget.id)}
                  aria-label={`Remover orçamento de ${budget.category.name}`}
                >
                  <Trash2 />
                </Button>
              </div>

              <Progress className="mt-4" value={budget.percentage} color={statusColor[budget.status]} />

              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{formatPercentage(budget.percentage)} consumido</span>
                <span>
                  {budget.status === "exceeded"
                    ? "Sem saldo disponível"
                    : `${budget.remaining.formatted} disponíveis`}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Definir orçamento</DialogTitle>
            <DialogDescription>
              O limite vale para {formatMonthLabel(month)}. Definir de novo a mesma categoria atualiza o
              valor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="budget-category">Categoria de despesa</Label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="budget-category" aria-invalid={Boolean(errors.category_id)}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.category_id?.message}</FieldError>
              {availableCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Todas as categorias de despesa já têm orçamento neste mês.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-limit">Limite mensal</Label>
              <Controller
                control={control}
                name="limit_amount"
                render={({ field }) => (
                  <MoneyInput id="budget-limit" value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError>{errors.limit_amount?.message}</FieldError>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={upsertBudget.isPending}>
                {upsertBudget.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
