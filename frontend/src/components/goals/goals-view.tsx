"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Loader2, Pencil, Plus, Target, Trash2, TrendingUp } from "lucide-react";
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
import { runMutation, useContributeGoal, useDeleteGoal, useGoals, useSaveGoal } from "@/hooks/use-nexosgen-financehub";
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metas"
        subtitle="Acompanhe seus objetivos financeiros"
        actions={
          <Button
            variant="gradient"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            Nova Meta
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Todas as Metas</TabsTrigger>
          <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>
      </Tabs>

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
            description="Defina um objetivo com valor e prazo — a nexosgen-financehub calcula quanto guardar por mês."
            action={
              <Button
                variant="gradient"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Nova Meta
              </Button>
            }
          />
        </Card>
      ) : null}

      {/*
        Cada meta é um cartão largo com barra de progresso. Empilhados, num
        monitor eles viram uma coluna de faixas com metros de vazio à direita;
        em duas colunas a barra ainda tem largura para ser legível.
      */}
      <div className="space-y-3 xl:grid xl:grid-cols-2 xl:gap-3 xl:space-y-0">
        {goals.map((goal) => {
          const Icon = resolveIcon(goal.icon);

          return (
            <Card key={goal.id} className="group flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              {goal.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={goal.image_url}
                  alt=""
                  className="h-24 w-full shrink-0 rounded-xl object-cover sm:w-32"
                />
              ) : (
                <span
                  className="flex h-24 w-full shrink-0 items-center justify-center rounded-xl sm:w-32"
                  style={{ backgroundColor: `${goal.color}1A`, color: goal.color }}
                >
                  <Icon className="size-8" />
                </span>
              )}

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{goal.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{goal.current_amount.formatted}</span> de{" "}
                      {goal.target_amount.formatted}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {goal.completed ? <Badge variant="income">Concluída</Badge> : null}
                    {goal.overdue ? <Badge variant="expense">Prazo vencido</Badge> : null}
                    <span className="text-lg font-semibold tabular-nums">
                      {formatPercentage(goal.percentage, 0)}
                    </span>
                  </div>
                </div>

                <Progress
                  value={goal.percentage}
                  color={`linear-gradient(90deg, ${goal.color} 0%, ${goal.color}CC 100%)`}
                />

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  {goal.deadline ? (
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="size-3.5" />
                      {goal.completed
                        ? `Concluída · prazo ${formatDate(goal.deadline)}`
                        : goal.months_remaining > 0
                          ? `Restam ${goal.months_remaining} ${goal.months_remaining === 1 ? "mês" : "meses"}`
                          : `Prazo em ${formatDate(goal.deadline)}`}
                    </span>
                  ) : null}

                  {!goal.completed ? (
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="size-3.5" />
                      {goal.suggested_monthly.formatted}/mês
                    </span>
                  ) : null}

                  <div className="ml-auto flex items-center gap-1">
                    {!goal.completed ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setContributing(goal);
                          setContribution(0);
                        }}
                      >
                        <Plus />
                        Aportar
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
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
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setPendingDelete(goal)}
                      aria-label={`Excluir ${goal.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
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
              <Input id="goal-image" placeholder="https://..." {...register("image_url")} />
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
