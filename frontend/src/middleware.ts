import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

const AUTH_ROUTES = ["/login", "/cadastro"];

/**
 * Guarda de rota baseada na presença do refresh token.
 *
 * A validação real acontece no backend; aqui o objetivo é apenas evitar que o
 * usuário caia numa tela protegida vazia (ou na tela de login já estando
 * autenticado).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (pathname === "/") {
    return NextResponse.redirect(new URL(hasSession ? "/dashboard" : "/login", request.url));
  }

  if (!hasSession && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserva o destino para retomar a navegação depois do login.
    if (pathname !== "/dashboard") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Todas as rotas exceto:
     * - /api      (as rotas de sessão e o proxy cuidam da própria autenticação)
     * - /_next    (assets do framework)
     * - arquivos estáticos
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
