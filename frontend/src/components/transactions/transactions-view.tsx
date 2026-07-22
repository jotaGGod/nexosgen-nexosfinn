"use client";

import { ArrowLeftRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { IconBadge } from "@/components/common/icon-badge";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { runMutation, useCategories, useDeleteTransaction, useTransactions } from "@/hooks/use-finapp";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/api";

const PAGE_SIZE = 8;
const ALL = "all";

/** Tela de transações: filtros, tabela paginada e formulário. */
export function TransactionsView() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>(ALL);
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const { data: categories = [] } = useCategories();
  const deleteTransaction = useDeleteTransaction();

  const params = useMemo(
    () => ({
      search: search.trim(),
      type: type === ALL ? undefined : type,
      category_id: categoryId === ALL ? undefined : [categoryId],
      page,
      page_size: PAGE_SIZE,
    }),
    [search, type, categoryId, page],
  );

  const { data, isPending, isError, refetch, isPlaceholderData } = useTransactions(params);

  /** Qualquer mudança de filtro volta para a primeira página. */
  function updateFilter(apply: () => void) {
    apply();
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const result = await runMutation(deleteTransaction, pendingDelete.id);
    if (result.ok) setPendingDelete(null);
  }

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const hasFilters = search.trim() !== "" || type !== ALL || categoryId !== ALL;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transações"
        subtitle="Gerencie todas as suas transações"
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus />
            Nova Transação
          </Button>
        }
      />

      {data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Total Receitas</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {data.totals.income.formatted}
            </p>
          </Card>
          <Card className="border-red-100 bg-red-50/60 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Total Despesas</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-red-600 dark:text-red-400">
              {data.totals.expense.formatted}
            </p>
          </Card>
          <Card className="border-violet-100 bg-violet-50/60 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Total Líquido</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-violet-700 dark:text-violet-400">
              {data.totals.net.formatted}
            </p>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => updateFilter(() => setSearch(event.target.value))}
                placeholder="Buscar transações..."
                className="pl-9"
                aria-label="Buscar transações"
              />
            </div>

            <Select value={categoryId} onValueChange={(value) => updateFilter(() => setCategoryId(value))}>
              <SelectTrigger className="sm:w-52" aria-label="Filtrar por categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={(value) => updateFilter(() => setType(value))}>
              <SelectTrigger className="sm:w-44" aria-label="Filtrar por tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {isPending && !isError ? <RowsSkeleton rows={6} /> : null}

        {data && items.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? "Nenhuma transação encontrada" : "Nenhuma transação ainda"}
            description={
              hasFilters
                ? "Ajuste os filtros para ver outros resultados."
                : "Registre seu primeiro lançamento para começar a acompanhar suas finanças."
            }
            action={
              hasFilters ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    updateFilter(() => {
                      setSearch("");
                      setType(ALL);
                      setCategoryId(ALL);
                    })
                  }
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button variant="gradient" onClick={openCreate}>
                  <Plus />
                  Nova Transação
                </Button>
              )
            }
          />
        ) : null}

        {items.length > 0 ? (
          <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
            {/* Tabela no desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border/70 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-5 py-3">Descrição</th>
                    <th scope="col" className="px-5 py-3">Categoria</th>
                    <th scope="col" className="px-5 py-3">Tipo</th>
                    <th scope="col" className="px-5 py-3 text-right">Valor</th>
                    <th scope="col" className="px-5 py-3">Data</th>
                    <th scope="col" className="px-5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {items.map((transaction) => (
                    <tr key={transaction.id} className="transition-colors hover:bg-secondary/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <IconBadge
                            size="sm"
                            icon={transaction.category.icon}
                            color={transaction.category.color}
                          />
                          <span className="font-medium text-foreground">{transaction.description}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{transaction.category.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {transaction.type === "income" ? "Receita" : "Despesa"}
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3 text-right font-semibold tabular-nums",
                          transaction.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-500 dark:text-red-400",
                        )}
                      >
                        {transaction.type === "income" ? "" : "-"}
                        {transaction.amount.formatted}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground tabular-nums">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEdit(transaction)}
                            aria-label={`Editar ${transaction.description}`}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setPendingDelete(transaction)}
                            aria-label={`Excluir ${transaction.description}`}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cartões no mobile: uma tabela de seis colunas não cabe na tela */}
            <ul className="divide-y divide-border/70 md:hidden">
              {items.map((transaction) => (
                <li key={transaction.id} className="flex items-center gap-3 px-4 py-3">
                  <IconBadge icon={transaction.category.icon} color={transaction.category.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{transaction.description}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {transaction.category.name} · {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-500 dark:text-red-400",
                      )}
                    >
                      {transaction.type === "income" ? "" : "-"}
                      {transaction.amount.formatted}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => openEdit(transaction)}
                        aria-label={`Editar ${transaction.description}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        onClick={() => setPendingDelete(transaction)}
                        aria-label={`Excluir ${transaction.description}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {pagination ? (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 px-5 py-4 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Mostrando {(pagination.page - 1) * pagination.page_size + 1} a{" "}
                  {Math.min(pagination.page * pagination.page_size, pagination.total)} de {pagination.total}{" "}
                  transações
                </p>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: Math.min(pagination.total_pages, 4) }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.page ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setPage(pageNumber)}
                        aria-current={pageNumber === pagination.page ? "page" : undefined}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.total_pages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} transaction={editing} />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.description}" será removida em definitivo. Esta ação não pode ser desfeita.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteTransaction.isPending}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
