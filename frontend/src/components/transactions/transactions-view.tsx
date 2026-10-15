"use client";

import { ArrowLeftRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { IconBadge } from "@/components/common/icon-badge";
import { PeriodPicker, monthPeriod, type PeriodValue } from "@/components/common/period-picker";
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runMutation, useCategories, useDeleteTransaction, useTransactions } from "@/hooks/use-nexosgen-nexosfinn";
import { formatDate, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/api";

const PAGE_SIZE = 8;
const ALL = "all";

/** Tela de transações: filtros, tabela paginada e formulário. */
export function TransactionsView() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>(ALL);
  const [categoryId, setCategoryId] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [period, setPeriod] = useState<PeriodValue>(() => monthPeriod(todayISO()));
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
      status: status === ALL ? undefined : status,
      start_date: period.start,
      end_date: period.end,
      page,
      page_size: PAGE_SIZE,
    }),
    [search, type, categoryId, status, period, page],
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
  const hasFilters = search.trim() !== "" || type !== ALL || categoryId !== ALL || status !== ALL;
  const filtrosAtivos = [search.trim() !== "", type !== ALL, categoryId !== ALL, status !== ALL].filter(Boolean).length;

  return (
    <div className="stagger space-y-5">
      <PageHeader
        title="Transações"
        subtitle="Gerencie todas as suas transações"
        actions={
          <>
            <PeriodPicker
              value={period}
              onChange={(nextPeriod) => updateFilter(() => setPeriod(nextPeriod))}
            />
            <Button variant="gradient" className="w-full sm:w-auto" onClick={openCreate}>
              <Plus />
              Nova Transação
            </Button>
          </>
        }
      />

      {data ? (
        <Card className="mobile-transaction-totals grid grid-cols-1 divide-y divide-border/70 px-6 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-0 sm:py-6">
          <div className="py-4 sm:px-7 sm:py-0">
            <p className="text-sm text-muted-foreground">Total de receitas</p>
            <p className="mt-1.5 text-[1.75rem] font-medium leading-tight tracking-[-0.03em] tabular-nums text-positive">
              {data.totals.income.formatted}
            </p>
          </div>
          <div className="py-4 sm:px-7 sm:py-0">
            <p className="text-sm text-muted-foreground">Total de despesas</p>
            <p className="mt-1.5 text-[1.75rem] font-medium leading-tight tracking-[-0.03em] tabular-nums text-negative">
              {data.totals.expense.formatted}
            </p>
          </div>
          <div className="py-4 sm:px-7 sm:py-0">
            <p className="text-sm text-muted-foreground">Total líquido</p>
            <p className="mt-1.5 text-[1.75rem] font-medium leading-tight tracking-[-0.03em] tabular-nums text-foreground">
              {data.totals.net.formatted}
            </p>
          </div>
        </Card>
      ) : null}

      {/* Barra de filtros em pílulas, como a linha de "filtros ativos" das referências. */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <p className="flex shrink-0 items-center gap-2 text-sm font-medium">
          Filtros
          {filtrosAtivos > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {filtrosAtivos}
            </span>
          ) : null}
        </p>
        <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => updateFilter(() => setSearch(event.target.value))}
              placeholder="Buscar transações..."
              className="pl-11"
              aria-label="Buscar transações"
              autoComplete="off"
            />
          </div>

          <Select value={categoryId} onValueChange={(value) => updateFilter(() => setCategoryId(value))}>
            <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoria">
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

          <Select value={status} onValueChange={(value) => updateFilter(() => setStatus(value))}>
            <SelectTrigger className="sm:w-48" aria-label="Filtrar por liquidação">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os status</SelectItem>
              <SelectItem value="settled">Liquidadas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
              <SelectItem value="future">Futuras</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Tipo como abas segmentadas: mesmo filtro que antes era um seletor. */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
          <h2 className="text-base font-semibold tracking-tight">Lançamentos</h2>
          <Tabs value={type} onValueChange={(value) => updateFilter(() => setType(value))}>
            <TabsList aria-label="Filtrar por tipo">
              <TabsTrigger value={ALL}>Todas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
                      setStatus(ALL);
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
            {/* Lista de lançamentos: uma linha por transação, legível em coluna estreita. */}
            <ul className="space-y-1 px-3 pb-3 sm:px-4">
              {items.map((transaction) => (
                <li
                  key={transaction.id}
                  className="group flex items-center gap-3 rounded-[22px] px-2.5 py-3 transition-colors hover:bg-secondary/60 sm:px-3"
                >
                  <IconBadge icon={transaction.category.icon} color={transaction.category.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{transaction.description}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {transaction.category.name} · {formatDate(transaction.date)}
                    </p>
                    <p
                      className={cn(
                        "mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        transaction.settlement.status === "settled"
                          ? "border-positive/25 bg-positive/10 text-positive"
                          : "border-warning/25 bg-warning/10 text-warning",
                      )}
                    >
                      {transaction.type === "expense"
                        ? transaction.settlement.status === "settled" ? "Paga" : "Não paga"
                        : transaction.settlement.status === "settled" ? "Recebida" : "Não recebida"}
                    </p>
                  </div>
                  {/*
                    No celular o valor fica acima das ações porque não há
                    largura para os dois lado a lado. No desktop sobra espaço, e
                    empilhá-los deixaria a linha alta e desalinhada — a partir de
                    `md` eles voltam para a mesma linha, com o valor em largura
                    fixa para que a coluna de números fique alinhada entre as
                    linhas em vez de dançar conforme o tamanho de cada uma.
                  */}
                  <div className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-3">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums md:w-32 md:text-right",
                        transaction.type === "income"
                          ? "text-positive"
                          : "text-negative",
                      )}
                    >
                      {transaction.type === "income" ? "" : "-"}
                      {transaction.amount.formatted}
                    </span>
                    <div className="hover-reveal flex gap-1">
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
                        className="size-8 text-destructive"
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
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:px-6">
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
