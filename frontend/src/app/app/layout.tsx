import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

/**
 * Casca das telas autenticadas.
 *
 * Layout de aplicativo: cabeçalho enxuto, conteúdo em coluna única e
 * navegação fixa na base. No desktop a mesma coluna apenas centraliza, em vez
 * de esticar — uma tabela financeira com 1400px de largura é pior de ler do
 * que uma coluna estreita, e manter um só layout elimina a classe de bugs em
 * que mobile e desktop divergem.
 *
 * A guarda de rota vive aqui, e não em middleware, porque middleware do Next
 * roda no Edge Runtime — que o modo de múltiplos serviços da Vercel não
 * suporta. A validação real do token continua no backend.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!store.get(REFRESH_TOKEN_COOKIE)?.value) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="safe-area-page pb-nav mx-auto w-full max-w-md">
        <AppHeader />
        <main className="mt-5">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
