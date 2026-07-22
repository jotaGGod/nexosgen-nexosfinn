import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

/**
 * Casca das telas autenticadas: sidebar fixa à esquerda e área de conteúdo
 * escura à direita, como no layout de referência.
 *
 * A guarda de rota vive aqui, e não em um middleware, porque middleware do
 * Next roda no Edge Runtime — que o modo de múltiplos serviços da Vercel não
 * suporta. Como Server Component ela roda no Node e cobre igualmente todas as
 * telas deste grupo.
 *
 * A validação real do token continua no backend; aqui o objetivo é só evitar
 * que o usuário caia numa tela protegida vazia.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (!store.get(REFRESH_TOKEN_COOKIE)?.value) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
