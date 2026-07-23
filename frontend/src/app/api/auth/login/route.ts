import { NextResponse } from "next/server";

import { backendUnavailableResponse, fetchBackend } from "@/lib/backend";
import { applySessionCookies } from "@/lib/session";
import type { AuthResponse } from "@/types/api";

/**
 * Autentica no backend e guarda a sessão em cookies httpOnly.
 *
 * O token nunca chega ao JavaScript da página: a resposta devolve apenas o
 * usuário, o suficiente para popular o estado da interface.
 */
export async function POST(request: Request) {
  const credentials = await request.text();

  let upstream: Response;
  try {
    upstream = await fetchBackend("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: credentials,
    });
  } catch {
    return backendUnavailableResponse();
  }

  const payload = await upstream.text();

  if (!upstream.ok) {
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = JSON.parse(payload) as AuthResponse;
  const response = NextResponse.json({ user: session.user });
  applySessionCookies(response, session);

  return response;
}
