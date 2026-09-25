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
} from "@/hooks/use-nexosgen-nexosfinn";
import { todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import { transactionSchema, type TransactionValues } from "@/schemas/transaction";
import type { Transaction } from "@/types/api";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preenchido quando o diálogo está editando um lançamento existente. */
  transaction?: Transaction | null;
  /**
   * Tipo pré-selecionado ao criar (atalhos "Adicionar despesa/receita" do
   * início). Só muda o valor inicial do seletor — o usuário ainda pode trocar.
   */
  defaultType?: TransactionValues["type"];
}

const emptyValues: TransactionValues = {
  type: "expense",
  amount: 0,
  description: "",
  category_id: "",
  account_id: "",
  date: todayISO(),
  notes: "",
  is_settled: false,
  settled_at: "",
};

/**
 * Formulário de nova transação / edição.
 *
 * A alternância Receita/Despesa é o primeiro controle porque define quais
 * categorias ficam disponíveis: o backend recusa uma despesa em categoria de
 * receita, então a interface já impede a combinação inválida.
 */
export function TransactionFormDialog({ open, onOpenChange, transaction, defaultType }: TransactionFormDialogProps) {
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
            is_settled: transaction.settlement?.status === "settled",
            settled_at: transaction.settlement?.settled_at ?? "",
          }
        : { ...emptyValues, type: defaultType ?? emptyValues.type },
    );
  }, [open, transaction, defaultType, reset]);

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
    const { is_settled, settled_at, ...base } = values;
    const payload = {
      ...base,
      ...(type === "expense" ? { is_paid: is_settled } : { is_received: is_settled }),
      ...(is_settled && settled_at ? { settled_at } : {}),
    };

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

        {/*
         * `px-1 -mx-1` acompanha o `overflow-x-clip`.
         *
         * O corte horizontal impede que um campo largo gere rolagem lateral no
         * diálogo, mas ele acontece na borda da caixa de preenchimento. Como os
         * campos são `w-full`, o anel de foco — que é desenhado 3px para fora
         * da caixa — caía justamente em cima dessa borda e aparecia fatiado nas
         * laterais. O preenchimento afasta a borda de corte o suficiente para o
         * anel caber, e a margem negativa devolve a largura original, então
         * nada muda de posição.
         */}
        <form onSubmit={handleSubmit(onSubmit)} className="-mx-1 min-w-0 space-y-4 overflow-x-clip px-1 pb-1" noValidate>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1" role="tablist">
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
                      "min-h-11 rounded-full py-2 text-sm font-medium transition-colors",
                      field.value === option.value
                        ? option.value === "income"
                          ? "bg-positive text-background shadow-sm"
                          : /*
                             * Vermelho, como em todo o resto do app (cards do
                             * dashboard, resumo e valores da lista de
                             * transações). `--negative` não tem uma
                             * `-foreground` própria, mas é numericamente
                             * idêntico a `--destructive` nos dois temas — o
                             * par de contraste já calibrado para este mesmo
                             * vermelho.
                             */
                            "bg-negative text-destructive-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          />

          <Controller
            control={control}
            name="is_settled"
            render={({ field }) => (
              <label className={cn(
                "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                field.value ? "border-positive/40 bg-positive/10" : "border-border bg-secondary/30",
              )}>
                <span>
                  <span className="block font-medium">{type === "expense" ? "Despesa paga" : "Receita recebida"}</span>
                  <span className="text-xs text-muted-foreground">{field.value ? "Liquidação registrada" : "Permanece pendente"}</span>
                </span>
                <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} className="size-4 accent-primary" />
              </label>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Salário, Freelance, etc."
              aria-invalid={Boolean(errors.description)}
              autoComplete="off"
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0 space-y-2">
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

            <div className="min-w-0 space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" className="min-w-0 px-3" aria-invalid={Boolean(errors.date)} {...register("date")} />
              <FieldError>{errors.date?.message}</FieldError>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0 space-y-2">
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

            <div className="min-w-0 space-y-2">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea id="notes" rows={2} className="min-h-[72px] resize-none" placeholder="Digite uma observação..." autoComplete="off" {...register("notes")} />
            <FieldError>{errors.notes?.message}</FieldError>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="w-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
