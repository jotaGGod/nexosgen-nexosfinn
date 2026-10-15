import type { ApiErrorBody } from "@/types/api";

/**
 * Erro de API já traduzido para o cliente.
 *
 * `fields` carrega os erros por campo devolvidos pelo backend, usados para
 * destacar os inputs do formulário.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

/**
 * Chama a API através do proxy do Next.
 *
 * O cliente nunca fala direto com o backend: o proxy adiciona o token lido do
 * cookie httpOnly e renova a sessão quando ela expira, de forma transparente.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // Sessão realmente encerrada: o proxy já removeu os cookies inválidos.
    // Não deixe todas as abas financeiras presas em um erro genérico.
    if (response.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/app")) {
      const destination = window.location.pathname + window.location.search;
      window.location.replace(`/login?redirect=${encodeURIComponent(destination)}`);
    }
    const body = payload as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error?.code ?? "unknown_error",
      body?.error?.message ?? "Não foi possível completar a operação.",
      body?.error?.fields,
    );
  }

  return payload as T;
}

/** Monta uma query string ignorando valores vazios. */
export function buildQuery(params: Record<string, string | number | boolean | string[] | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue;

    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
