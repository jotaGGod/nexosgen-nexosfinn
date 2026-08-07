import {
  ArrowUpRight,
  Banknote,
  Eye,
  Landmark,
  Lock,
  MessageSquareText,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import { DemoAssistente, DemoCategorizacao, DemoMetas } from "@/components/landing/demos";
import { Reveal } from "@/components/landing/reveal";

/** Título padrão de seção, para não repetir a mesma escala em cada bloco. */
function TituloSecao({ sobretitulo, titulo, texto }: { sobretitulo: string; titulo: string; texto?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{sobretitulo}</span>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{titulo}</h2>
      {texto ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{texto}</p> : null}
    </div>
  );
}

/** Barra de confiança logo abaixo da dobra. */
export function StatsBar() {
  const itens = [
    { valor: "300+", rotulo: "bancos conectados" },
    { valor: "AES-256", rotulo: "criptografia dos dados" },
    { valor: "Open Finance", rotulo: "regulado pelo Banco Central" },
    { valor: "Somente leitura", rotulo: "ninguém move seu dinheiro" },
  ];

  return (
    <section className="mx-auto mt-24 w-full max-w-6xl px-5">
      <Reveal className="surface grid grid-cols-2 gap-px overflow-hidden bg-border lg:grid-cols-4">
        {itens.map((item) => (
          <div key={item.rotulo} className="bg-card px-5 py-6 text-center">
            <p className="text-lg font-semibold tracking-tight">{item.valor}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.rotulo}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/** Grade de quatro recursos. */
export function FeaturesGrid() {
  const recursos = [
    {
      icone: Sparkles,
      titulo: "Categorização automática",
      texto: "Cada lançamento chega já classificado, sem você tocar em nada.",
    },
    {
      icone: PieChart,
      titulo: "Orçamento por categoria",
      texto: "Defina um teto mensal e receba aviso antes de estourar.",
    },
    {
      icone: Target,
      titulo: "Metas com prazo",
      texto: "Diga quanto e para quando; a nexosgen-financehub calcula o aporte do mês.",
    },
    {
      icone: MessageSquareText,
      titulo: "Assistente que responde",
      texto: "Pergunte em português e receba o número, não um relatório.",
    },
  ];

  return (
    <section id="recursos" className="mx-auto mt-32 w-full max-w-6xl scroll-mt-24 px-5">
      <TituloSecao
        sobretitulo="Recursos"
        titulo="O trabalho chato fica com a gente"
        texto="Planilha exige disciplina. A nexosgen-financehub exige que você abra o aplicativo."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recursos.map((recurso, indice) => {
          const Icone = recurso.icone;
          return (
            <Reveal key={recurso.titulo} delay={indice * 70} className="surface p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icone className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{recurso.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{recurso.texto}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/** Três blocos alternados, cada um com uma demonstração em SVG. */
export function Showcase() {
  const blocos = [
    {
      sobretitulo: "Assistente",
      titulo: "Pergunte sobre seu dinheiro",
      texto:
        "Em vez de garimpar filtros, escreva a pergunta. O assistente lê seu histórico e responde com o valor, a comparação e o que isso significa para o restante do mês.",
      demo: <DemoAssistente />,
    },
    {
      sobretitulo: "Categorização",
      titulo: "Seus gastos se organizam sozinhos",
      texto:
        "A nexosgen-financehub reconhece o estabelecimento e classifica o lançamento na hora. Quando você corrige uma vez, ela aprende e não erra de novo naquele comércio.",
      demo: <DemoCategorizacao />,
    },
    {
      sobretitulo: "Metas",
      titulo: "Do desejo ao valor do mês",
      texto:
        "Informe quanto precisa juntar e até quando. A nexosgen-financehub divide pelo prazo, acompanha cada aporte e recalcula sozinha quando você adianta ou atrasa.",
      demo: <DemoMetas />,
    },
  ];

  return (
    <section className="mx-auto mt-32 w-full max-w-6xl space-y-24 px-5">
      {blocos.map((bloco, indice) => {
        const invertido = indice % 2 === 1;

        return (
          <Reveal key={bloco.titulo} as="article" className="grid items-center gap-10 lg:grid-cols-2">
            <div className={invertido ? "lg:order-2" : undefined}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                {bloco.sobretitulo}
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{bloco.titulo}</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                {bloco.texto}
              </p>
            </div>

            {/* Proporção fixa: o bloco reserva o espaço antes de pintar. */}
            <div className={invertido ? "lg:order-1" : undefined} style={{ aspectRatio: "4 / 3" }}>
              {bloco.demo}
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}

/** Seção de segurança. */
export function Security() {
  const itens = [
    {
      icone: Eye,
      titulo: "Somente leitura",
      texto: "A nexosgen-financehub enxerga seus lançamentos e nada além disso. Nenhuma transferência sai daqui.",
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
    <section id="seguranca" className="mx-auto mt-32 w-full max-w-6xl scroll-mt-24 px-5">
      <TituloSecao
        sobretitulo="Segurança"
        titulo="Acesso ao extrato, nunca ao seu saldo"
        texto="Conectar o banco é dar permissão de leitura. Nada mais."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {itens.map((item, indice) => {
          const Icone = item.icone;
          return (
            <Reveal key={item.titulo} delay={indice * 70} className="surface p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icone className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.texto}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/** Chamada final. */
export function FinalCTA() {
  return (
    <section className="mx-auto mt-32 w-full max-w-6xl px-5">
      <Reveal className="surface relative overflow-hidden px-6 py-16 text-center sm:px-12">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative">
          <ShieldCheck className="mx-auto size-10 text-primary" />
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Comece hoje, leva dois minutos
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Crie sua conta, conecte seus bancos e veja para onde seu dinheiro está indo.
          </p>

          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
          >
            Criar conta grátis
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

/** Rodapé. */
export function LandingFooter() {
  const colunas = [
    { titulo: "Produto", itens: ["Recursos", "Planos", "Segurança"] },
    { titulo: "Empresa", itens: ["Sobre", "Blog", "Contato"] },
    { titulo: "Legal", itens: ["Termos de uso", "Privacidade", "Cookies"] },
  ];

  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="flex items-center gap-2">
              <Banknote className="size-5 text-primary" />
              <span className="font-semibold tracking-tight">nexosgen-financehub</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Finanças pessoais sem planilha, sem esforço e sem surpresa no fim do mês.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">Suporte de segunda a sexta, 9h às 18h</p>
          </div>

          {colunas.map((coluna) => (
            <div key={coluna.titulo}>
              <p className="text-sm font-semibold">{coluna.titulo}</p>
              <ul className="mt-3 space-y-2">
                {coluna.itens.map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} nexosgen-financehub. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            A nexosgen-financehub não é uma instituição financeira e não movimenta recursos.
          </p>
        </div>
      </div>
    </footer>
  );
}
