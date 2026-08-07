import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
    <div className="ambient-grid relative flex min-h-[100svh] w-full max-w-full overflow-x-clip bg-background lg:p-3 xl:p-5">
      <div className="absolute right-[max(1rem,env(safe-area-inset-right,0px))] top-[calc(1rem+env(safe-area-inset-top,0px))] z-30 lg:right-5 lg:top-5">
        <ThemeToggle />
      </div>

      <aside className="glass-panel relative hidden w-[54%] flex-col justify-between overflow-hidden rounded-[32px] p-10 xl:p-14 lg:flex">
        {/* Halos de cor: o único uso de área ampla do accent em toda a interface. */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-[520px] rounded-full bg-primary/[0.11] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 size-[420px] rounded-full bg-accent/[0.07] blur-3xl"
          aria-hidden="true"
        />

        <Logo size="lg" />

        <div className="relative max-w-xl">
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Inteligência financeira pessoal</span>
          <h2 className="mt-6 max-w-lg text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] text-foreground xl:text-5xl">
            Seu dinheiro,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              sob controle
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Acompanhe receitas e despesas, defina limites por categoria e veja suas metas saindo do papel.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground xl:grid-cols-2">
            {destaques.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary shadow-[0_0_9px_hsl(var(--primary)/0.7)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} NexosFinn
        </p>
      </aside>

      <main className="safe-area-auth relative flex min-h-[100svh] w-full flex-col justify-start overflow-x-hidden lg:min-h-0 lg:w-[46%] lg:justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Logo size="lg" />
          </div>
          <div className="surface rounded-[32px] bg-card/80 p-6 backdrop-blur-xl sm:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
