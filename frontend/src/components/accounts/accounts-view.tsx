"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { ColorIconPicker } from "@/components/common/color-icon-picker";
import { IconBadge } from "@/components/common/icon-badge";
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
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { runMutation, useAccounts, useDeleteAccount, useSaveAccount } from "@/hooks/use-nexosgen-nexosfinn";
import { accountTypeIcons, accountTypeLabels } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { accountSchema, type AccountValues } from "@/schemas/transaction";
import type { Account } from "@/types/api";

const defaults: AccountValues = {
  name: "",
  type: "checking",
  initial_balance: 0,
  color: "#C6FF3D",
  icon: "landmark",
};

/** Tela de contas: saldo consolidado no topo e cartões por conta. */
export function AccountsView() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Account | null>(null);

  const { data: accounts = [], isPending, isError, refetch } = useAccounts();
  const saveAccount = useSaveAccount();
  const deleteAccount = useDeleteAccount();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountValues>({ resolver: zodResolver(accountSchema), defaultValues: defaults });

  useEffect(() => {
    if (!formOpen) return;
    reset(
      editing
        ? {
            name: editing.name,
            type: editing.type,
            initial_balance: editing.initial_balance.amount,
            color: editing.color,
            icon: editing.icon,
          }
        : defaults,
    );
  }, [formOpen, editing, reset]);

  const selectedType = watch("type");

  // Trocar o tipo sugere o ícone correspondente, mas só na criação: em uma
  // conta já existente o usuário pode ter escolhido outro de propósito.
  useEffect(() => {
    if (editing) return;
    setValue("icon", accountTypeIcons[selectedType] ?? "wallet");
  }, [selectedType, editing, setValue]);

  const total = accounts.reduce((sum, account) => sum + account.balance.amount, 0);

  async function onSubmit(values: AccountValues) {
    // O formulário só fecha em caso de sucesso: se a API recusar (nome
    // duplicado, por exemplo), o usuário mantém o que digitou e vê o motivo.
    const result = await runMutation(saveAccount, editing ? { id: editing.id, ...values } : values);
    if (result.ok) setFormOpen(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const result = await runMutation(deleteAccount, pendingDelete.id);
    if (result.ok) setPendingDelete(null);
  }

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="Contas"
        subtitle="Suas contas, cartões e carteiras"
        actions={
          <Button
            variant="gradient"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus />
            Nova Conta
          </Button>
        }
      />

      {accounts.length > 0 ? (
        <Card className="border-active/25 bg-active/5 p-6">
          <p className="text-sm font-medium text-muted-foreground">Saldo consolidado</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Soma do saldo de {accounts.length} conta{accounts.length > 1 ? "s" : ""} ativa
            {accounts.length > 1 ? "s" : ""}
          </p>
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

      {!isPending && accounts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Nenhuma conta cadastrada"
            description="Cadastre uma conta para começar a registrar lançamentos."
            action={
              <Button
                variant="gradient"
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                Nova Conta
              </Button>
            }
          />
        </Card>
      ) : null}

      {accounts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {accounts.map((account) => (
            <Card key={account.id} className="group p-5">
              <div className="flex items-start justify-between gap-3">
                <IconBadge icon={account.icon} color={account.color} size="lg" />

                <div className="hover-reveal flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      setEditing(account);
                      setFormOpen(true);
                    }}
                    aria-label={`Editar ${account.name}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    onClick={() => setPendingDelete(account)}
                    aria-label={`Excluir ${account.name}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <p className="mt-4 truncate text-sm font-medium">{account.name}</p>
              <p className="text-xs text-muted-foreground">{accountTypeLabels[account.type]}</p>

              {/*
                Em duas colunas o cartão tem cerca de 166px, e um saldo na casa
                dos milhares não cabe em text-xl: o "R$" ficava sozinho numa
                linha e o número na seguinte. O corpo menor mantém o valor
                inteiro numa linha só, e nada de dinheiro pode quebrar no meio.

                A partir de `md` a grade dá largura de sobra ao cartão, e aí o
                valor volta ao tamanho de destaque que ele merece.
              */}
              <p
                className={cn(
                  "mt-3 whitespace-nowrap text-base font-semibold tabular-nums md:text-xl",
                  account.balance.amount < 0
                    ? "text-negative"
                    : "text-foreground",
                )}
              >
                {account.balance.formatted}
              </p>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Conta" : "Nova Conta"}</DialogTitle>
            <DialogDescription>
              O saldo exibido é sempre o saldo inicial somado aos lançamentos da conta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="account-name">Nome</Label>
              <Input
                id="account-name"
                placeholder="Ex: Conta Corrente"
                aria-invalid={Boolean(errors.name)}
                autoComplete="off"
                {...register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account-type">Tipo</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="account-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(accountTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-balance">Saldo inicial</Label>
                <Controller
                  control={control}
                  name="initial_balance"
                  render={({ field }) => (
                    <MoneyInput id="account-balance" value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError>{errors.initial_balance?.message}</FieldError>
              </div>
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
              <Button type="submit" variant="gradient" disabled={saveAccount.isPending}>
                {saveAccount.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              Contas com lançamentos não podem ser excluídas — nesse caso, arquive-a pela edição.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteAccount.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
