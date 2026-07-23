import "server-only";

import { NextResponse } from "next/server";

const BACKEND_TIMEOUT_MS = 12_000;

/** Resolve o service binding apenas no momento da requisicao. */
function getBackendURL() {
  const configured = process.env.BACKEND_URL ?? process.env.API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_URL nao foi configurada no ambiente de producao");
  }
  return "http://localhost:8080";
}

/**
 * Chama o servico Go com limite menor que o timeout da funcao da Vercel.
 * Assim uma instancia indisponivel vira um 503 recuperavel em segundos, em
 * vez de prender a interface ate o limite de 300 segundos da plataforma.
 */
export async function fetchBackend(path: string, init: RequestInit = {}) {
  const startedAt = Date.now();

  try {
    return await fetch(`${getBackendURL()}${path}`, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "backend indisponivel",
        path,
        duration_ms: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    throw error;
  }
}

/** Resposta uniforme para falhas de rede entre Next.js e Go. */
export function backendUnavailableResponse() {
  return NextResponse.json(
    {
      error: {
        code: "backend_unavailable",
        message: "O serviço está demorando para responder. Tente novamente em instantes.",
      },
    },
    { status: 503 },
  );
}
