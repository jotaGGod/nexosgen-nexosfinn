import { Eye, KeyRound, Landmark, Lock, RefreshCw, ShieldCheck, Workflow } from "lucide-react";

import { Destaque, Eyebrow, Halo, Section, SectionHeading } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";
import { Logo } from "@/components/layout/logo";

/**
 * Faixa de confiança logo abaixo da prévia, no lugar da fileira de logos das
 * referências: aqui os "selos" são fatos do produto, não marcas de terceiros.
 */
export function TrustBar() {
  const itens = [
    { icone: Landmark, valor: "300+", rotulo: "bancos conectados" },
    { icone: Lock, valor: "AES-256", rotulo: "criptografia dos dados" },
    { icone: ShieldCheck, valor: "Open Finance", rotulo: "regulado pelo Banco Central" },
    { icone: Eye, valor: "Somente leitura", rotulo: "ninguém move seu dinheiro" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 pb-4 sm:px-8">
      <Reveal className="flex items-center gap-6">
        <span className="hidden h-px flex-1 bg-gradient-to-r from-transparent to-white/10 lg:block" aria-hidden="true" />
        <ul className="grid flex-[3] grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:flex-[4]">
          {itens.map((item) => {
            const Icone = item.icone;
            return (
              <li key={item.rotulo} className="flex flex-col items-center gap-1 text-center">
                <span className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground/90 sm:text-lg">
                  <Icone className="size-4 text-muted-foreground" />
                  {item.valor}
                </span>
                <span className="text-xs text-muted-foreground">{item.rotulo}</span>
              </li>
            );
          })}
        </ul>
        <span className="hidden h-px flex-1 bg-gradient-to-l from-transparent to-white/10 lg:block" aria-hidden="true" />
      </Reveal>
    </div>
  );
}

/**
 * Integrações: a API externa com chaves por escopo.
 *
 * Os grupos e rotas espelham a aba de integrações do app — o que está aqui é
 * exatamente o que a API expõe.
 */
export function Integrations() {
  const grupos = [
    { titulo: "Transações", rota: "/transactions" },
    { titulo: "Categorias", rota: "/categories" },
    { titulo: "Saldo e contas", rota: "/balance · /accounts" },
    { titulo: "Metas e aportes", rota: "/goals" },
    { titulo: "Orçamentos", rota: "/budgets" },
  ];

  const passos = [
    { icone: KeyRound, texto: "Gere uma chave de API com os escopos que quiser liberar." },
    { icone: Workflow, texto: "Use no n8n ou em qualquer automação com o cabeçalho X-API-Key." },
    { icone: RefreshCw, texto: "Revogue a chave quando quiser, direto nas configurações." },
  ];

  return (
    <Section id="integracoes">
      <Reveal className="lp-card overflow-hidden bg-[linear-gradient(160deg,#121212,#0A0A0A_60%)]">
        <Halo className="-left-40 -top-40 size-[560px]" intensity={0.16} />
        <div className="relative grid items-center gap-12 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
          <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
            <Eyebrow>Integrações</Eyebrow>
            <h2 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
              Conecte às suas <Destaque>automações</Destaque>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              A NexosFinn tem uma API externa pronta para receber e consultar seus dados. Registre gastos a partir de
              um fluxo no n8n — como um assistente de mensagens — sem abrir o aplicativo.
            </p>

            <ol className="mt-8 w-full max-w-md space-y-3 text-left">
              {passos.map((passo, indice) => {
                const Icone = passo.icone;
                return (
                  <li key={indice} className="lp-well flex items-center gap-3.5 p-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
                      <Icone className="size-4" />
                    </span>
                    <span className="text-sm text-foreground/85">{passo.texto}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/60 font-mono text-[12px] leading-relaxed shadow-[0_40px_100px_-40px_rgba(255,95,20,0.35)]">
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3 text-[11px] text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                /api/v1/external
              </div>
              <div className="space-y-1 overflow-x-auto px-4 py-4">
                <p>
                  <span className="text-accent">GET</span> <span className="text-foreground/90">/balance</span>
                </p>
                <p className="text-muted-foreground">
                  X-API-Key: <span className="text-foreground/70">nfh_live_••••••••</span>
                </p>
                <p className="pt-3 text-positive">200 OK</p>
              </div>
              <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06]">
                {grupos.map((grupo) => (
                  <li key={grupo.titulo} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="font-sans text-[13px] text-foreground/90">{grupo.titulo}</span>
                    <span className="truncate text-muted-foreground">{grupo.rota}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/** Segurança. */
export function Security() {
  const itens = [
    {
      icone: Eye,
      titulo: "Somente leitura",
      texto: "A NexosFinn enxerga seus lançamentos e nada além disso. Nenhuma transferência sai daqui.",
    },
    {
      icone: Landmark,
      titulo: "Open Finance",
      texto: "A conexão com os bancos segue o padrão regulado pelo Banco Central.",
    },
    {
      icone: Lock,
      titulo: "Criptografia bancária",
      texto: "Seus dados são cifrados em trânsito e em repouso, com AES-256.",
    },
  ];

  return (
    <Section id="seguranca">
      <SectionHeading
        eyebrow="Segurança"
        titulo={
          <>
            Acesso ao extrato, <Destaque>nunca ao seu saldo</Destaque>
          </>
        }
        texto="Conectar o banco é dar permissão de leitura. Nada mais."
      />

      <div className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3">
        {itens.map((item, indice) => {
          const Icone = item.icone;
          return (
            <Reveal key={item.titulo} delay={indice * 80} className="h-full">
              <article className="lp-card lp-card-hover flex h-full flex-col items-center p-7 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                  <Icone className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.titulo}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/** Rodapé. */
export function LandingFooter() {
  const colunas: { titulo: string; itens: { rotulo: string; href?: string }[] }[] = [
    {
      titulo: "Produto",
      itens: [
        { rotulo: "Recursos", href: "#recursos" },
        { rotulo: "Análises", href: "#analises" },
        { rotulo: "Integrações", href: "#integracoes" },
        { rotulo: "Planos", href: "#planos" },
        { rotulo: "Segurança", href: "#seguranca" },
      ],
    },
    { titulo: "Empresa", itens: [{ rotulo: "Sobre" }, { rotulo: "Blog" }, { rotulo: "Contato" }] },
    { titulo: "Legal", itens: [{ rotulo: "Termos de uso" }, { rotulo: "Privacidade" }, { rotulo: "Cookies" }] },
  ];

  return (
    <footer className="relative mt-8 overflow-hidden border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1240px] px-5 pt-16 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Finanças pessoais sem planilha, sem esforço e sem surpresa no fim do mês.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Suporte de segunda a sexta, 9h às 18h</p>
          </div>

          {colunas.map((coluna) => (
            <div key={coluna.titulo}>
              <p className="text-sm font-semibold">{coluna.titulo}</p>
              <ul className="mt-4 space-y-2.5">
                {coluna.itens.map((item) => (
                  <li key={item.rotulo}>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {item.rotulo}
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">{item.rotulo}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NexosFinn. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">A NexosFinn não é uma instituição financeira e não movimenta recursos.</p>
        </div>
      </div>

      {/* Assinatura gigante no pé da página, esmaecendo para o fundo. */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.22em] select-none whitespace-nowrap bg-gradient-to-b from-white/[0.14] to-white/0 bg-clip-text text-center text-[18vw] font-semibold leading-none tracking-[-0.06em] text-transparent 2xl:text-[260px]"
      >
        Nexosfinn
      </p>
    </footer>
  );
}
