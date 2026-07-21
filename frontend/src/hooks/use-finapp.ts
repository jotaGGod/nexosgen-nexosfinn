"use client";

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError, apiFetch, buildQuery } from "@/lib/api-client";
import type {
  Account,
  APIKey,
  Budget,
  BudgetList,
  Category,
  CreatedAPIKey,
  Dashboard,
  Envelope,
  Goal,
  Report,
  Transaction,
  TransactionList,
  User,
} from "@/types/api";

/**
 * Camada de acesso a dados da interface.
 *
 * Cada tela consome hooks daqui em vez de chamar fetch diretamente: as chaves
 * de cache ficam num lugar só, e as invalidações após mutação ficam explícitas.
 */

export const queryKeys = {
  dashboard: (params: DashboardParams) => ["dashboard", params] as const,
  transactions: (params: TransactionParams) => ["transactions", params] as const,
  categories: (type?: string) => ["categories", type ?? "all"] as const,
  accounts: () => ["accounts"] as const,
  goals: (filter?: string) => ["goals", filter ?? "all"] as const,
  budgets: (month: string) => ["budgets", month] as const,
  report: (params: ReportParams) => ["report", params] as const,
  apiKeys: () => ["api-keys"] as const,
  profile: () => ["profile"] as const,
};

/** Invalida tudo que depende de lançamentos. */
function useFinancialInvalidation() {
  const queryClient = useQueryClient();

  return () => {
    for (const key of ["dashboard", "transactions", "report", "budgets", "accounts"]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
}

/** Traduz um erro de API em uma notificação legível. */
function notifyError(error: unknown, fallback: string) {
  const message = error instanceof ApiError ? error.message : fallback;
  toast.error(message);
}

/** Resultado de uma mutation executada por `runMutation`. */
export type MutationResult<TData> = { ok: true; data: TData } | { ok: false };

/**
 * Executa uma mutation sem deixar a rejeição escapar.
 *
 * `mutateAsync` rejeita sempre que a API devolve erro. Como o `onError` de
 * cada mutation já comunica a falha por toast, deixar a promessa rejeitar de
 * novo dentro de um handler de evento produz uma rejeição não tratada — que
 * em produção derruba a árvore React na error boundary do Next e substitui a
 * tela inteira por "Application error".
 *
 * O retorno é um objeto com `ok` em vez do dado direto porque mutations de
 * exclusão resolvem com `void`: sem essa marcação explícita, sucesso e falha
 * seriam indistinguíveis para o chamador.
 */
export async function runMutation<TData, TVariables>(
  mutation: { mutateAsync: (variables: TVariables) => Promise<TData> },
  variables: TVariables,
): Promise<MutationResult<TData>> {
  try {
    return { ok: true, data: await mutation.mutateAsync(variables) };
  } catch {
    return { ok: false };
  }
}

// --- Dashboard ---

export interface DashboardParams {
  start_date?: string;
  end_date?: string;
  cashflow_months?: number;
}

export function useDashboard(params: DashboardParams) {
  return useQuery({
    queryKey: queryKeys.dashboard(params),
    queryFn: () => apiFetch<Dashboard>(`/dashboard${buildQuery({ ...params })}`),
  });
}

// --- Relatórios ---

export interface ReportParams {
  start_date?: string;
  end_date?: string;
  trend_months?: number;
}

export function useReport(params: ReportParams) {
  return useQuery({
    queryKey: queryKeys.report(params),
    queryFn: () => apiFetch<Report>(`/reports${buildQuery({ ...params })}`),
  });
}

// --- Transações ---

export interface TransactionParams {
  search?: string;
  type?: string;
  category_id?: string[];
  account_id?: string[];
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: string;
}

export interface TransactionPayload {
  type: string;
  amount: number;
  description: string;
  category_id: string;
  account_id: string;
  date: string;
  notes: string;
}

export function useTransactions(params: TransactionParams) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => apiFetch<TransactionList>(`/transactions${buildQuery({ ...params })}`),
    placeholderData: (previous) => previous,
  });
}

export function useCreateTransaction() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (payload: TransactionPayload) =>
      apiFetch<Transaction>("/transactions", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      invalidate();
      toast.success("Transação criada");
    },
    onError: (error) => notifyError(error, "Não foi possível criar a transação."),
  });
}

export function useUpdateTransaction() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({ id, ...payload }: TransactionPayload & { id: string }) =>
      apiFetch<Transaction>(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => {
      invalidate();
      toast.success("Transação atualizada");
    },
    onError: (error) => notifyError(error, "Não foi possível atualizar a transação."),
  });
}

export function useDeleteTransaction() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast.success("Transação excluída");
    },
    onError: (error) => notifyError(error, "Não foi possível excluir a transação."),
  });
}

// --- Categorias ---

export interface CategoryPayload {
  name: string;
  type: string;
  color: string;
  icon: string;
  archived?: boolean;
}

export function useCategories(type?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: async () => {
      const response = await apiFetch<Envelope<Category[]>>(`/categories${buildQuery({ type })}`);
      return response.data;
    },
    // Categorias mudam pouco e são usadas em quase toda tela.
    staleTime: 5 * 60_000,
    enabled: options?.enabled ?? true,
  });
}

export function useSaveCategory() {
  const queryClient = useQueryClient();
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({ id, ...payload }: CategoryPayload & { id?: string }) =>
      id
        ? apiFetch<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) })
        : apiFetch<Category>("/categories", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      invalidate();
      toast.success(variables.id ? "Categoria atualizada" : "Categoria criada");
    },
    onError: (error) => notifyError(error, "Não foi possível salvar a categoria."),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria excluída");
    },
    onError: (error) => notifyError(error, "Não foi possível excluir a categoria."),
  });
}

// --- Contas ---

export interface AccountPayload {
  name: string;
  type: string;
  initial_balance: number;
  color: string;
  icon: string;
  archived?: boolean;
}

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts(),
    queryFn: async () => {
      const response = await apiFetch<Envelope<Account[]>>("/accounts");
      return response.data;
    },
    staleTime: 60_000,
  });
}

export function useSaveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: AccountPayload & { id?: string }) =>
      id
        ? apiFetch<Account>(`/accounts/${id}`, { method: "PUT", body: JSON.stringify(payload) })
        : apiFetch<Account>("/accounts", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(variables.id ? "Conta atualizada" : "Conta criada");
    },
    onError: (error) => notifyError(error, "Não foi possível salvar a conta."),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Conta excluída");
    },
    onError: (error) => notifyError(error, "Não foi possível excluir a conta."),
  });
}

// --- Metas ---

export interface GoalPayload {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  image_url: string;
  icon: string;
  color: string;
  archived?: boolean;
}

export function useGoals(filter?: string) {
  return useQuery({
    queryKey: queryKeys.goals(filter),
    queryFn: async () => {
      const response = await apiFetch<Envelope<Goal[]>>(`/goals${buildQuery({ filter })}`);
      return response.data;
    },
  });
}

export function useSaveGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: GoalPayload & { id?: string }) =>
      id
        ? apiFetch<Goal>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) })
        : apiFetch<Goal>("/goals", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(variables.id ? "Meta atualizada" : "Meta criada");
    },
    onError: (error) => notifyError(error, "Não foi possível salvar a meta."),
  });
}

export function useContributeGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      apiFetch<Goal>(`/goals/${id}/contributions`, { method: "POST", body: JSON.stringify({ amount }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Aporte registrado");
    },
    onError: (error) => notifyError(error, "Não foi possível registrar o aporte."),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meta excluída");
    },
    onError: (error) => notifyError(error, "Não foi possível excluir a meta."),
  });
}

// --- Orçamentos ---

export function useBudgets(month: string) {
  return useQuery({
    queryKey: queryKeys.budgets(month),
    queryFn: () => apiFetch<BudgetList>(`/budgets${buildQuery({ month })}`),
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { category_id: string; month: string; limit_amount: number }) =>
      apiFetch<Budget>("/budgets", { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Orçamento definido");
    },
    onError: (error) => notifyError(error, "Não foi possível definir o orçamento."),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/budgets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Orçamento removido");
    },
    onError: (error) => notifyError(error, "Não foi possível remover o orçamento."),
  });
}

// --- Integrações ---

export function useAPIKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys(),
    queryFn: async () => {
      const response = await apiFetch<Envelope<APIKey[]>>("/api-keys");
      return response.data;
    },
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; scopes: string[]; expires_at?: string }) =>
      apiFetch<CreatedAPIKey>("/api-keys", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (error) => notifyError(error, "Não foi possível gerar a chave."),
  });
}

export function useRevokeAPIKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api-keys/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("Chave revogada");
    },
    onError: (error) => notifyError(error, "Não foi possível revogar a chave."),
  });
}

// --- Perfil ---

export function useProfile(options?: Partial<UseQueryOptions<User>>) {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: () => apiFetch<User>("/me"),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; email: string }) =>
      apiFetch<User>("/me", { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado");
    },
    onError: (error) => notifyError(error, "Não foi possível atualizar o perfil."),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      apiFetch<void>("/me/password", { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => toast.success("Senha alterada"),
    onError: (error) => notifyError(error, "Não foi possível alterar a senha."),
  });
}
