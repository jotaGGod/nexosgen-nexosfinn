"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { MoneyInput } from "@/components/common/money-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  runMutation,
  useAccounts,
  useCategories,
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-nexosgen-financehub";
import { todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import { transactionSchema, type TransactionValues } from "@/schemas/transaction";
import type { Transaction } from "@/types/api";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preenchido quando o diálogo está editando um lançamento existente. */
  transaction?: Transaction | null;
}

const emptyValues: TransactionValues = {
  type: "expense",
  amount: 0,
  description: "",
  category_id: "",
  account_id: "",
  date: todayISO(),
  notes: "",
};

/**
 * Formulário de nova transação / edição.
 *
 * A alternância Receita/Despesa é o primeiro controle porque define quais
 * categorias ficam disponíveis: o backend recusa uma despesa em categoria de
 * receita, então a interface já impede a combinação inválida.
 */
export function TransactionFormDialog({ open, onOpenChange, transaction }: TransactionFormDialogProps) {
  const isEditing = Boolean(transaction);

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const { data: accounts = [] } = useAccounts();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: emptyValues,
  });

  const type = watch("type");
  const { data: categories = [] } = useCategories(type, { enabled: open });

  useEffect(() => {
    if (!open) return;

    reset(
      transaction
        ? {
            type: transaction.type,
            amount: transaction.amount.amount,
            description: transaction.description,
            category_id: transaction.category.id,
            account_id: transaction.account.id,
            date: transaction.date,
            notes: transaction.notes,
          }
        : emptyValues,
    );
  }, [open, transaction, reset]);

  const selectedCategory = watch("category_id");

  // Ao trocar o tipo, a categoria escolhida pode não pertencer mais à lista.
  useEffect(() => {
    if (!selectedCategory) return;
    if (categories.length === 0) return;
    if (!categories.some((category) => category.id === selectedCategory)) {
      setValue("category_id", "");
    }
  }, [categories, selectedCategory, setValue]);

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  async function onSubmit(values: TransactionValues) {
    const payload = { ...values };

    const result = transaction
      ? await runMutation(updateTransaction, { id: transaction.id, ...payload })
      : await runMutation(createTransaction, payload);

    // Só fecha em caso de sucesso: numa recusa da API o usuário não perde o
    // que digitou e vê o motivo no toast.
    if (result.ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados do lançamento." : "Adicione uma nova transação."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1" role="tablist">
                {(
                  [
                    { value: "income", label: "Receita" },
                    { value: "expense", label: "Despesa" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={field.value === option.value}
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "rounded-lg py-2 text-sm font-medium transition-colors",
                      field.value === option.value
                        ? option.value === "income"
                          ? "bg-positive text-background shadow-sm"
                          : "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Freelance, etc."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <MoneyInput
                  id="amount"
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={Boolean(errors.amount)}
                />
              )}
            />
            <FieldError>{errors.amount?.message}</FieldError>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category" aria-invalid={Boolean(errors.category_id)}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.category_id?.message}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" aria-invalid={Boolean(errors.date)} {...register("date")} />
              <FieldError>{errors.date?.message}</FieldError>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Controller
              control={control}
              name="account_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="account" aria-invalid={Boolean(errors.account_id)}>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.account_id?.message}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea id="notes" rows={3} placeholder="Digite uma observação..." {...register("notes")} />
            <FieldError>{errors.notes?.message}</FieldError>
          </div>

          <div className="space-y-2 pt-1">
            <Button type="submit" variant="gradient" className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar Transação
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
