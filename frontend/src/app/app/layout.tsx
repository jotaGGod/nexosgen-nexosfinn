import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

/**
 * Casca das telas autenticadas.
 *
 * Dois layouts, um por classe de dispositivo:
 *
 * - Até `lg`: coluna única centrada e navegação fixa na base, dimensionadas
 *   pelo alcance do polegar.
 * - De `lg` em diante: barra lateral permanente e conteúdo largo. Manter a
 *   coluna de 448px no monitor desperdiçava a tela inteira — sobrava uma faixa
 *   estreita no meio com vazio dos dois lados.
 *
 * O limite de `max-w-7xl` existe porque linha de texto e tabela financeira
 * ficam ruins de ler quando esticam sem fim num monitor ultrawide; a partir
 * daí o conteúdo centraliza em vez de continuar crescendo.
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
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar />

      {/* min-w-0 para que uma tabela larga role dentro da área, e não empurre a lateral. */}
      <div className="min-w-0 flex-1">
        <div className="safe-area-page pb-nav mx-auto w-full max-w-md lg:max-w-7xl lg:pb-12">
          <AppHeader />
          <main className="mt-5 lg:mt-8">{children}</main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
