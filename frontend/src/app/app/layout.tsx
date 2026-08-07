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
    <div className="ambient-grid relative min-h-dvh overflow-x-clip bg-background lg:flex lg:p-3">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/[0.035] to-transparent" />
      <Sidebar />

      {/* min-w-0 para que uma tabela larga role dentro da área, e não empurre a lateral. */}
      <div className="relative min-w-0 flex-1">
        <div className="safe-area-page pb-nav relative mx-auto w-full max-w-md md:max-w-3xl lg:max-w-7xl lg:px-8 lg:pb-12">
          <AppHeader />
          <main className="mt-4 lg:mt-0">{children}</main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
