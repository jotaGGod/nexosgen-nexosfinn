"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError } from "@/lib/api-client";

/**
 * Provider do TanStack Query.
 *
 * O cliente é criado dentro de estado para que cada sessão do navegador tenha
 * o seu, sem vazar cache entre requisições no servidor.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dados financeiros mudam a cada lançamento; meio minuto é o
            // suficiente para evitar refetch em cada troca de aba.
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Erros de autenticação e validação não melhoram com repetição.
              if (error instanceof ApiError && error.status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
