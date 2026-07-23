import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fetchBackend } from "@/lib/backend";
import { REFRESH_TOKEN_COOKIE, clearSessionCookies } from "@/lib/session";

/**
 * Encerra a sessão: revoga o refresh token no backend e limpa os cookies.
 *
 * Se a revogação falhar, os cookies são apagados mesmo assim — do ponto de
 * vista do usuário, sair precisa funcionar sempre.
 */
export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetchBackend("/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Backend indisponível não pode impedir o usuário de sair.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);

  return response;
}
