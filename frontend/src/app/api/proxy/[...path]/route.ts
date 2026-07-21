import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  REFRESH_TOKEN_COOKIE,
  applySessionCookies,
  clearSessionCookies,
} from "@/lib/session";
import type { AuthResponse } from "@/types/api";

/**
 * Proxy entre o navegador e a API.
 *
 * Existe por dois motivos:
 *
 * 1. **Segurança** — o access token vive em cookie httpOnly. Só o servidor do
 *    Next consegue lê-lo e anexá-lo ao cabeçalho Authorization, então um XSS
 *    na página não consegue roubar a sessão.
 * 2. **Renovação transparente** — quando o backend responde 401 por token
 *    expirado, o proxy usa o refresh token, repete a requisição original e
 *    devolve os cookies renovados. A tela não percebe a expiração.
 */

const JSON_HEADERS = { "Content-Type": "application/json" };

async function callBackend(
  target: string,
  method: string,
  body: string | undefined,
  accessToken: string | undefined,
) {
  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetch(target, { method, headers, body, cache: "no-store" });
}

async function renewSession(refreshToken: string): Promise<AuthResponse | null> {
  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!upstream.ok) return null;
  return (await upstream.json()) as AuthResponse;
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${API_BASE_URL}/api/v1/${path.join("/")}${request.nextUrl.search}`;

  const method = request.method;
  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();

  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;

  let upstream = await callBackend(target, method, body, accessToken);
  let renewed: AuthResponse | null = null;

  if (upstream.status === 401 && refreshToken) {
    renewed = await renewSession(refreshToken);
    if (renewed) {
      upstream = await callBackend(target, method, body, renewed.access_token);
    }
  }

  const payload = await upstream.text();
  const response = new NextResponse(payload || null, {
    status: upstream.status,
    headers: JSON_HEADERS,
  });

  if (renewed) {
    applySessionCookies(response, renewed);
  } else if (upstream.status === 401) {
    // A sessão acabou de vez: limpar os cookies faz o layout autenticado
    // mandar o usuário para o login na próxima navegação.
    clearSessionCookies(response);
  }

  return response;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
