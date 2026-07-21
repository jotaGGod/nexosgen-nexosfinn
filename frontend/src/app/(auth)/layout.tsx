import { Logo } from "@/components/layout/logo";

/**
 * Casca das telas públicas.
 *
 * O painel escuro à esquerda repete a identidade da sidebar; no mobile ele
 * some e sobra apenas o formulário.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex">
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-[420px] rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 size-[380px] rounded-full bg-fuchsia-500/20 blur-3xl"
          aria-hidden="true"
        />

        <Logo />

        <div className="relative">
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            Suas finanças,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              organizadas
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
            Acompanhe receitas e despesas, defina orçamentos por categoria e veja suas metas saindo do papel.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-slate-400">
            {[
              "Dashboard com fluxo de caixa e gastos por categoria",
              "Orçamentos mensais com alerta de estouro",
              "Integração com automações via chave de API",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-violet-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} FinApp</p>
      </aside>

      <main className="flex w-full flex-col items-center justify-center px-5 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
