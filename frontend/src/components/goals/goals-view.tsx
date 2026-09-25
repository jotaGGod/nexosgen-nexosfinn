"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Loader2, Pencil, Plus, PlusCircle, Target, Trash2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ColorIconPicker } from "@/components/common/color-icon-picker";
import { MoneyInput } from "@/components/common/money-input";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { runMutation, useContributeGoal, useDeleteGoal, useGoals, useSaveGoal } from "@/hooks/use-nexosgen-nexosfinn";
import { formatDate, formatPercentage } from "@/lib/format";
import { resolveIcon } from "@/lib/icons";
import { goalSchema, type GoalValues } from "@/schemas/transaction";
import type { Goal } from "@/types/api";

const defaults: GoalValues = {
  name: "",
  target_amount: 0,
  current_amount: 0,
  deadline: "",
  image_url: "",
  icon: "target",
  color: "#C6FF3D",
};

/** Tela de metas: cartões com progresso, prazo e aporte sugerido. */
export function GoalsView() {
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [contribution, setContribution] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<Goal | null>(null);

  const { data: goals = [], isPending, isError, refetch } = useGoals(filter === "all" ? undefined : filter);
  const saveGoal = useSaveGoal();
  const contributeGoal = useContributeGoal();
  const deleteGoal = useDeleteGoal();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalValues>({ resolver: zodResolver(goalSchema), defaultValues: defaults });

  useEffect(() => {
    if (!formOpen) return;
    reset(
      editing
        ? {
            name: editing.name,
            target_amount: editing.target_amount.amount,
            current_amount: editing.current_amount.amount,
            deadline: editing.deadline,
            image_url: editing.image_url,
            icon: editing.icon,
            color: editing.color,
          }
        : defaults,
    );
  }, [formOpen, editing, reset]);

  async function onSubmit(values: GoalValues) {
    const result = await runMutation(saveGoal, editing ? { id: editing.id, ...values } : values);
    if (result.ok) setFormOpen(false);
  }

  async function confirmContribution() {
    if (!contributing || contribution === 0) return;

    const result = await runMutation(contributeGoal, { id: contributing.id, amount: contribution });
    if (!result.ok) return;

    setContributing(null);
    setContribution(0);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const result = await runMutation(deleteGoal, pendingDelete.id);
    if (result.ok) setPendingDelete(null);
  }

  function novaMeta() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="Metas"
        subtitle="Acompanhe seus objetivos financeiros"
        actions={
          <Button variant="gradient" className="hidden lg:inline-flex" onClick={novaMeta}>
            <Plus />
            Nova Meta
          </Button>
        }
      />

      {/* Criar meta: o cartão em degradê das referências, no celular. */}
      <button
        type="button"
        onClick={novaMeta}
        className="brand-gradient flex w-full items-center justify-between rounded-[28px] px-5 py-5 text-left shadow-[0_20px_44px_-24px_rgba(255,106,26,0.8)] transition-transform duration-200 ease-out-expo active:scale-[0.98] lg:hidden"
      >
        <span>
          <span className="block text-xs opacity-70">Adicionar</span>
          <span className="block text-xl font-semibold tracking-tight">Nova meta</span>
        </span>
        <PlusCircle className="size-7" strokeWidth={1.5} />
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-medium tracking-tight">Lista de metas</h2>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="in_progress">Em andamento</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isError ? (
        <Card>
          <ErrorState onRetry={() => void refetch()} />
        </Card>
      ) : null}

      {isPending && !isError ? (
        <Card>
          <RowsSkeleton rows={3} />
        </Card>
      ) : null}

      {!isPending && goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title="Nenhuma meta neste filtro"
            description="Defina um objetivo com valor e prazo — a NexosFinn calcula quanto guardar por mês."
            action={
              <Button variant="gradient" onClick={novaMeta}>
                <Plus />
                Nova Meta
              </Button>
            }
          />
        </Card>
      ) : null}

      {/*
        Cada meta é um cartão com a régua de progresso (0% · atual · 100%), a
        barra grossa em degradê e três colunas: alvo, guardado e prazo. No
        desktop, duas ou três colunas de cartões.
      */}
      <div className="grid gap-3 md:grid-cols-2 lg:gap-4 2xl:grid-cols-3">
        {goals.map((goal) => {
          const Icon = resolveIcon(goal.icon);
          const pct = Math.min(Math.max(goal.percentage, 0), 100);

          return (
            <Card key={goal.id} className="group flex flex-col p-5">
              <div className="flex items-start gap-3">
                {goal.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={goal.image_url} alt="" className="size-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${goal.color}1F`, color: goal.color }}
                  >
                    <Icon className="size-5" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">{goal.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {goal.completed ? <Badge variant="income">Concluída</Badge> : null}
                    {goal.overdue ? <Badge variant="expense">Prazo vencido</Badge> : null}
                    {!goal.completed && !goal.overdue ? (
                      <span className="text-xs text-muted-foreground">Em andamento</span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    onClick={() => {
                      setEditing(goal);
                      setFormOpen(true);
                    }}
                    aria-label={`Editar ${goal.name}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-destructive hover:bg-destructive/10"
                    onClick={() => setPendingDelete(goal)}
                    aria-label={`Excluir ${goal.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="mt-4 border-t border-border/70 pt-4">
                <p className="text-xs text-muted-foreground">Progresso</p>
                <div className="relative mt-2 h-4 text-[10px] tabular-nums text-muted-foreground">
                  <span className="absolute left-0">0%</span>
                  <span
                    className="absolute -translate-x-1/2 text-xs font-semibold text-foreground"
                    style={{ left: `${Math.min(Math.max(pct, 8), 88)}%` }}
                  >
                    {formatPercentage(goal.percentage, 0)}
                  </span>
                  <span className="absolute right-0">100%</span>
                </div>
                <Progress value={goal.percentage} size="lg" className="mt-1.5" />

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Meta</p>
                    <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">{goal.target_amount.formatted}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Guardado</p>
                    <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">{goal.current_amount.formatted}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">
                      {goal.deadline ? formatDate(goal.deadline) : "Sem prazo"}
                    </p>
                    {goal.deadline && !goal.completed ? (
                      <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <CalendarClock className="size-3" />
                        {goal.months_remaining > 0
                          ? `Restam ${goal.months_remaining} ${goal.months_remaining === 1 ? "mês" : "meses"}`
                          : `Prazo em ${formatDate(goal.deadline)}`}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {!goal.completed ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-full border border-border/70 bg-secondary/50 py-1.5 pl-4 pr-1.5">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="size-3.5 shrink-0" />
                    <span className="truncate">
                      <span className="font-semibold text-foreground tabular-nums">{goal.suggested_monthly.formatted}</span>/mês
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => {
                      setContributing(goal);
                      setContribution(0);
                    }}
                  >
                    <Plus />
                    Aportar
                  </Button>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Meta" : "Nova Meta"}</DialogTitle>
            <DialogDescription>
              Com um prazo definido, calculamos automaticamente quanto guardar por mês.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="goal-name">Nome</Label>
              <Input
                id="goal-name"
                placeholder="Ex: Viagem Europa"
                aria-invalid={Boolean(errors.name)}
                autoComplete="off"
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal-target">Valor alvo</Label>
                <Controller
                  control={control}
                  name="target_amount"
                  render={({ field }) => (
                    <MoneyInput id="goal-target" value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError>{errors.target_amount?.message}</FieldError>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-current">Valor já guardado</Label>
                <Controller
                  control={control}
                  name="current_amount"
                  render={({ field }) => (
                    <MoneyInput id="goal-current" value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError>{errors.current_amount?.message}</FieldError>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Prazo (opcional)</Label>
              <Input id="goal-deadline" type="date" {...register("deadline")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-image">URL da imagem (opcional)</Label>
              <Input id="goal-image" placeholder="https://..." autoComplete="off" {...register("image_url")} />
              <FieldError>{errors.image_url?.message}</FieldError>
            </div>

            <ColorIconPicker
              color={watch("color")}
              icon={watch("icon")}
              onColorChange={(color) => setValue("color", color)}
              onIconChange={(icon) => setValue("icon", icon)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gradient" disabled={saveGoal.isPending}>
                {saveGoal.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(contributing)} onOpenChange={(open) => !open && setContributing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar aporte</DialogTitle>
            <DialogDescription>
              {contributing ? `Quanto você guardou para "${contributing.name}"?` : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="contribution">Valor</Label>
            <MoneyInput id="contribution" value={contribution} onChange={setContribution} autoFocus />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setContributing(null)}>
              Cancelar
            </Button>
            <Button
              variant="gradient"
              onClick={confirmContribution}
              disabled={contribution <= 0 || contributeGoal.isPending}
            >
              {contributeGoal.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Aportar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `"${pendingDelete.name}" será removida em definitivo.` : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteGoal.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
