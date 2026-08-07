import type { NextResponse } from "next/server";

import type { AuthResponse } from "@/types/api";

/**
 * Nomes dos cookies da sessão.
 *
 * Os dois são httpOnly: o JavaScript da página nunca lê o access token nem o
 * refresh token. As chamadas do cliente passam pelo proxy em /api/proxy, que
 * anexa o token no servidor.
 */
export const ACCESS_TOKEN_COOKIE = "nexosgen-nexosfinn_access";
export const REFRESH_TOKEN_COOKIE = "nexosgen-nexosfinn_refresh";

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
