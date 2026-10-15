import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { backendUnavailableResponse, fetchBackend } from "@/lib/backend";
import {
  ACCESS_TOKEN_COOKIE,
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
const pendingRefreshes = new Map<string, Promise<AuthResponse | null>>();

async function callBackend(
  path: string,
  method: string,
  body: string | undefined,
  accessToken: string | undefined,
) {
  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return fetchBackend(path, { method, headers, body });
}

async function renewSession(refreshToken: string): Promise<AuthResponse | null> {
  const pending = pendingRefreshes.get(refreshToken);
  if (pending) return pending;

  const renewal = (async () => {
    const upstream = await fetchBackend("/api/v1/auth/refresh", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (upstream.status === 401 || upstream.status === 403) return null;
    // Uma indisponibilidade temporária não encerra a sessão do usuário.
    if (!upstream.ok) throw new Error("session_refresh_unavailable");
    return (await upstream.json()) as AuthResponse;
  })();

  pendingRefreshes.set(refreshToken, renewal);
  try {
    return await renewal;
  } finally {
    if (pendingRefreshes.get(refreshToken) === renewal) {
      pendingRefreshes.delete(refreshToken);
    }
  }
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `/api/v1/${path.join("/")}${request.nextUrl.search}`;

  const method = request.method;
  const body = method === "GET" || method === "DELETE" ? undefined : await request.text();

  const store = await cookies();
  let accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;

  let renewed: AuthResponse | null = null;

  try {
    // O cookie de acesso expira antes do refresh. Renovar antes da chamada
    // evita um 401 e uma ida adicional ao backend sempre que o app e reaberto.
    if (!accessToken && refreshToken) {
      renewed = await renewSession(refreshToken);
      accessToken = renewed?.access_token;
    }

    let upstream = await callBackend(target, method, body, accessToken);
    if (upstream.status === 401 && refreshToken && !renewed) {
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
  } catch {
    return backendUnavailableResponse();
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
