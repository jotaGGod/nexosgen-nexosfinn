import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

const destaques = [
  "Categorização automática dos seus gastos",
  "Metas com aporte mensal calculado",
  "Assistente que responde sobre suas finanças",
];

/**
 * Casca das telas públicas de acesso.
 *
 * Coluna única, centrada e estreita — a mesma forma do aplicativo. O painel
 * lateral de marca aparece só a partir do desktop, onde há largura sobrando.
 *
 * Quem já tem sessão não deve ver login nem cadastro; a redireção acontece
 * aqui pelo mesmo motivo do grupo autenticado: sem middleware, sem Edge.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  if (store.get(REFRESH_TOKEN_COOKIE)?.value) {
    redirect("/app/dashboard");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        {/* Halos de cor: o único uso de área ampla do accent em toda a interface. */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-[420px] rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 size-[380px] rounded-full bg-accent/10 blur-3xl"
          aria-hidden="true"
        />

        <Logo size="lg" />

        <div className="relative">
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-foreground">
            Seu dinheiro,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              sob controle
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Acompanhe receitas e despesas, defina limites por categoria e veja suas metas saindo do papel.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {destaques.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vanta
        </p>
      </aside>

      <main className="safe-area-auth flex w-full flex-col justify-center lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size="lg" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
