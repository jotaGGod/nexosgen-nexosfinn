"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutGrid, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ColorIconPicker } from "@/components/common/color-icon-picker";
import { IconBadge } from "@/components/common/icon-badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { runMutation, useCategories, useDeleteCategory, useSaveCategory } from "@/hooks/use-finapp";
import { categorySchema, type CategoryValues } from "@/schemas/transaction";
import type { Category } from "@/types/api";

const defaults: CategoryValues = { name: "", type: "expense", color: "#C6FF3D", icon: "tag" };

/** Tela de categorias: grade por tipo, com criação e edição. */
export function CategoriesView() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const { data: categories = [], isPending, isError, refetch } = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: defaults });

  useEffect(() => {
    if (!formOpen) return;
    reset(
      editing
        ? { name: editing.name, type: editing.type, color: editing.color, icon: editing.icon }
        : defaults,
    );
  }, [formOpen, editing, reset]);

  const visible = categories.filter((category) => filter === "all" || category.type === filter);

  async function onSubmit(values: CategoryValues) {
    const result = await runMutation(saveCategory, editing ? { id: editing.id, ...values } : values);
    if (result.ok) setFormOpen(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const result = await runMutation(deleteCategory, pendingDelete.id);
    if (result.ok) setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        subtitle="Organize suas receitas e despesas"
        actions={
          <Button
            variant="gradient"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            Nova Categoria
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError ? (
        <Card>
          <ErrorState onRetry={() => void refetch()} />
        </Card>
      ) : null}

      {isPending && !isError ? (
        <Card>
          <RowsSkeleton rows={5} />
        </Card>
      ) : null}

      {!isPending && visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={LayoutGrid}
            title="Nenhuma categoria neste filtro"
            description="Crie categorias para classificar seus lançamentos e alimentar os relatórios."
            action={
              <Button
                variant="gradient"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Nova Categoria
              </Button>
            }
          />
        </Card>
      ) : null}

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((category) => (
            // O cartão empilha em vez de alinhar em linha: em duas colunas ele
            // tem cerca de 166px, e ícone + ações + nome lado a lado não cabem
            // — o nome era espremido até zero e sumia da tela.
            <Card key={category.id} className="group flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <IconBadge icon={category.icon} color={category.color} />

                <div className="hover-reveal -mr-1 -mt-1 flex shrink-0 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      setEditing(category);
                      setFormOpen(true);
                    }}
                    aria-label={`Editar ${category.name}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    onClick={() => setPendingDelete(category)}
                    aria-label={`Excluir ${category.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{category.name}</p>
                <Badge variant={category.type === "income" ? "income" : "expense"} className="mt-1.5">
                  {category.type === "income" ? "Receita" : "Despesa"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>Escolha um nome, um tipo, uma cor e um ícone.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome</Label>
              <Input
                id="category-name"
                placeholder="Ex: Alimentação"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-type">Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                O tipo não pode ser alterado depois que a categoria já tem lançamentos.
              </p>
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
              <Button type="submit" variant="gradient" disabled={saveCategory.isPending}>
                {saveCategory.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Categorias com lançamentos não podem ser excluídas — nesse caso, arquive-a pela edição.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteCategory.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
