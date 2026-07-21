"use client";

import { ErrorScreen } from "@/components/common/error-screen";

/**
 * Fronteira de erro das rotas.
 *
 * Captura exceções de renderização das telas e mostra a causa, em vez da
 * mensagem genérica do Next.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen error={error} reset={reset} />;
}
