import type { NextResponse } from "next/server";

import type { AuthResponse } from "@/types/api";

/**
 * Nomes dos cookies da sessão.
 *
 * Os dois são httpOnly: o JavaScript da página nunca lê o access token nem o
 * refresh token. As chamadas do cliente passam pelo proxy em /api/proxy, que
 * anexa o token no servidor.
 */
export const ACCESS_TOKEN_COOKIE = "finapp_access";
export const REFRESH_TOKEN_COOKIE = "finapp_refresh";

/**
 * URL do backend, acessada apenas pelo servidor do Next.
 *
 * A ordem de precedência cobre os três ambientes:
 *
 * 1. `BACKEND_URL` — injetada pela Vercel através do service binding
 *    declarado no vercel.json. Aponta para o serviço internamente, sem sair
 *    para a internet, e já na raiz dele: por isso `/api/v1/...` chega ao
 *    router Go exatamente como ele espera.
 * 2. `API_BASE_URL` — usada pelo Docker Compose (`http://backend:8080`).
 * 3. localhost — execução direta na máquina.
 */
export const API_BASE_URL =
  process.env.BACKEND_URL ?? process.env.API_BASE_URL ?? "http://localhost:8080";

const isProduction = process.env.NODE_ENV === "production";

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    // Em produção o app roda sob HTTPS; em desenvolvimento, http://localhost
    // não aceitaria um cookie Secure.
    secure: isProduction,
    path: "/",
    maxAge,
  };
}

/** Grava os cookies da sessão na resposta. */
export function applySessionCookies(response: NextResponse, session: AuthResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, baseCookieOptions(session.expires_in));
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    session.refresh_token,
    baseCookieOptions(session.refresh_token_expires_in),
  );
}

/** Remove os cookies da sessão. */
export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", baseCookieOptions(0));
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", baseCookieOptions(0));
}
