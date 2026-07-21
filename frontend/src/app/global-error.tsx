"use client";

import { ErrorScreen } from "@/components/common/error-screen";

import "./globals.css";

/**
 * Fronteira de erro do layout raiz.
 *
 * É acionada quando a falha acontece acima das rotas — o caso em que o Next
 * substitui a página inteira por "Application error". Precisa renderizar as
 * próprias tags <html> e <body>, porque o layout raiz não chegou a montar.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorScreen error={error} reset={reset} />
      </body>
    </html>
  );
}
