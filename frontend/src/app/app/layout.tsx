import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { PageTransition } from "@/components/layout/page-transition";
import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

/**
 * Casca das telas autenticadas.
 *
 * - Celular: coluna única, sem nenhuma faixa fixa. O cabeçalho (menu e
 *   avatar) rola junto com o conteúdo e a página vai de ponta a ponta — o
 *   topo do início pinta atrás da área segura (ver .bleed-top em globals.css),
 *   e a base termina com o respiro do indicador de início, sem barra.
 * - Desktop: barra superior em pílulas e conteúdo largo até 1400px; a partir
 *   daí centraliza, porque tabela financeira fica ruim de ler esticada num
 *   monitor ultrawide.
 *
 * O respiro do topo (0.75rem + área segura), a altura do cabeçalho (3rem) e o
 * espaço até o conteúdo (1.25rem) são os mesmos valores que o .bleed-top
 * desconta — mudar um exige mudar o outro.
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
    <div className="relative min-h-dvh overflow-x-clip bg-background">
      {/* Luz laranja discreta no alto da tela; rola junto, não é faixa fixa. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(55%_60%_at_85%_0%,hsl(var(--primary)/0.10),transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-md px-[max(1rem,env(safe-area-inset-left,0px))] pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:max-w-2xl sm:px-6 md:max-w-3xl lg:max-w-[1400px] lg:px-8 lg:pb-14 lg:pt-5">
        <AppHeader />
        <main className="mt-5 lg:mt-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
