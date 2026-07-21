import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

/**
 * Raiz do site.
 *
 * Encaminha para o dashboard ou para o login conforme exista sessão. Este
 * desvio era feito pelo middleware; como middleware roda no Edge Runtime e o
 * modo de múltiplos serviços da Vercel não o suporta, ele passou a ser uma
 * página de servidor.
 */
export default async function RootPage() {
  const store = await cookies();
  redirect(store.get(REFRESH_TOKEN_COOKIE)?.value ? "/dashboard" : "/login");
}
