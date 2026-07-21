import { NextResponse } from "next/server";

import { API_BASE_URL, applySessionCookies } from "@/lib/session";
import type { AuthResponse } from "@/types/api";

/**
 * Cria a conta no backend e já abre a sessão, evitando um login logo depois
 * do cadastro.
 */
export async function POST(request: Request) {
  const body = await request.text();

  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const payload = await upstream.text();

  if (!upstream.ok) {
    return new NextResponse(payload, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = JSON.parse(payload) as AuthResponse;
  const response = NextResponse.json({ user: session.user }, { status: 201 });
  applySessionCookies(response, session);

  return response;
}
