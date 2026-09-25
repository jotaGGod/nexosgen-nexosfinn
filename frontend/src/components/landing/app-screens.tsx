import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Menu,
  MinusCircle,
  Plus,
  PlusCircle,
  Search,
  ShoppingBasket,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  Briefcase,
  Car,
  HeartPulse,
  House,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Telas do aplicativo NexosFinn para dentro do iPhone da página de vendas.
 *
 * São réplicas fiéis das telas mobile reais (app/app/*): os mesmos rótulos,
 * a mesma hierarquia e os mesmos componentes visuais — topo em degradê do
 * início, lista de receitas/despesas, atalhos, colunas por categoria,
 * lançamentos com status, metas com régua de progresso. Os valores são
 * ilustrativos.
 *
 * Tudo é desenhado numa base fixa de 430 × 932 (a tela do aparelho escala
 * por fora), e as peças que a timeline anima levam atributos `data-*`:
 * `data-count` (contagem do saldo), `data-bar` (colunas que crescem),
 * `data-row` (linhas que entram), `data-goalbar` (barras de meta).
 */

/* --- Dados ilustrativos, coerentes entre si --- */

export const DADOS = {
  nome: "Ana",
  periodo: "Setembro de 2026",
  saldo: 7580.5,
  receitas: "R$ 9.200,00",
  despesas: "R$ 5.412,30",
  economia: "R$ 3.787,70",
};

export const CATEGORIAS = [
  { nome: "Moradia", pct: 38, valor: "R$ 2.050,00", cor: "#FF8A4C" },
  { nome: "Alimentação", pct: 24, valor: "R$ 1.300,00", cor: "#F5B544" },
  { nome: "Transporte", pct: 16, valor: "R$ 866,00", cor: "#7DD3FC" },
  { nome: "Lazer", pct: 12, valor: "R$ 649,48", cor: "#C4B5FD" },
  { nome: "Saúde", pct: 10, valor: "R$ 546,82", cor: "#86EFAC" },
];

/* --- Peças comuns --- */

function StatusBar({ escuro = false }: { escuro?: boolean }) {
  const cor = escuro ? "#140800" : "#ffffff";
  return (
    <div className="flex h-[54px] items-center justify-between px-[34px] pt-1" style={{ color: cor }}>
      <span className="text-[17px] font-semibold tracking-tight">9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[5, 7, 9, 11].map((h) => (
            <span key={h} className="w-[3px] rounded-sm" style={{ height: h, background: cor }} />
          ))}
        </span>
        <span className="ml-1 h-[12px] w-[25px] rounded-[4px] border-[1.5px] p-[1.5px]" style={{ borderColor: cor }}>
          <span className="block h-full w-[70%] rounded-[2px]" style={{ background: cor }} />
        </span>
      </span>
    </div>
  );
}

function Pilulas() {
  return (
    <div className="flex h-12 items-center justify-between">
      <span className="flex h-11 w-16 items-center justify-center rounded-full border border-white/10 bg-[#111] text-white">
        <Menu className="size-5" />
      </span>
      <span className="flex h-11 w-16 items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#FF6A1A,#F5A524)] text-[13px] font-bold text-[#140800]">
        AL
      </span>
    </div>
  );
}

function Cartao({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[28px] border border-white/[0.08] bg-[#111111]", className)}>{children}</div>;
}

function Periodo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-11 items-center justify-between gap-3 rounded-full px-5 text-[14px] font-semibold",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <CalendarDays className="size-4 text-[#FF6A1A]" />
        {DADOS.periodo}
      </span>
      <ChevronDown className="size-4 opacity-60" />
    </span>
  );
}

function Variacao({ valor, bom = true, rotulo }: { valor: string; bom?: boolean; rotulo?: string }) {
  const Icone = valor.startsWith("+") ? TrendingUp : TrendingDown;
  return (
    <span className="flex items-center gap-1.5 text-[12px]">
      <span className={cn("flex items-center gap-1 font-semibold", bom ? "text-[#34D399]" : "text-[#FF5C5C]")}>
        <Icone className="size-3.5" />
        {valor}
      </span>
      {rotulo ? <span className="text-white/50">{rotulo}</span> : null}
    </span>
  );
}

/* --- Blocos do início (reaproveitados pela vista explodida) --- */

/** Posições fixas dos blocos do início, compartilhadas com a vista explodida. */
export const BLOCOS = {
  topo: { top: 0, height: 448 },
  saldo: { top: 276, height: 150 },
  resumo: { top: 464, height: 178 },
  atalhos: { top: 658, height: 116 },
  categorias: { top: 790, height: 300 },
};

export function BlocoTopo({ comSaldo = true }: { comSaldo?: boolean }) {
  return (
    <section
      className="brand-gradient absolute inset-x-0 rounded-b-[40px] px-5"
      style={{ top: BLOCOS.topo.top, height: BLOCOS.topo.height }}
    >
      <div className="-mx-5">
        <StatusBar escuro />
      </div>
      <Pilulas />
      <h1 className="mt-4 text-[38px] leading-[1.08] tracking-[-0.035em]">
        <span className="block font-normal">Olá,</span>
        <span className="block font-bold">{DADOS.nome}!</span>
      </h1>
      <Periodo className="mt-3 bg-[#0B0B0B]/90 text-white" />
      {comSaldo ? <BlocoSaldo /> : null}
    </section>
  );
}

export function BlocoSaldo() {
  return (
    <div
      className="absolute inset-x-5 rounded-[30px] bg-[#0B0B0B] p-5 text-white shadow-[0_24px_50px_-24px_rgba(90,30,0,0.75)]"
      style={{ top: BLOCOS.saldo.top, height: BLOCOS.saldo.height }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-white/70">Saldo total</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-white/[0.08]">
          <Wallet className="size-4 text-[#FF6A1A]" />
        </span>
      </div>
      <p className="mt-4 text-right text-[36px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
        <span data-count={DADOS.saldo}>R$ 7.580,50</span>
      </p>
      <div className="mt-2.5 flex justify-end">
        <Variacao valor="+12,5%" rotulo="vs mês anterior" />
      </div>
    </div>
  );
}

export function BlocoResumo() {
  const linhas = [
    { rotulo: "Receitas", valor: DADOS.receitas, variacao: "+3,4%", tom: "text-[#34D399]" },
    { rotulo: "Despesas", valor: DADOS.despesas, variacao: "−6,9%", tom: "text-[#FF5C5C]" },
    { rotulo: "Economia", valor: DADOS.economia, variacao: "+18,2%", tom: "text-white" },
  ];
  return (
    <Cartao className="absolute inset-x-5 px-5 py-1.5">
      <ul className="divide-y divide-white/[0.07]" style={{ height: BLOCOS.resumo.height - 14 }}>
        {linhas.map((linha) => (
          <li key={linha.rotulo} className="flex items-center justify-between py-3">
            <div>
              <p className="text-[15px] text-white/90">{linha.rotulo}</p>
              <Variacao valor={linha.variacao} />
            </div>
            <p className={cn("text-[17px] font-semibold tabular-nums", linha.tom)}>{linha.valor}</p>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}

export function BlocoAtalhos() {
  const base = "flex h-[116px] flex-col justify-between rounded-[26px] border border-white/[0.08] bg-[#111111] p-4";
  return (
    <div className="absolute inset-x-5 grid grid-cols-3 gap-2.5">
      <div className={base}>
        <MinusCircle className="ml-auto size-6 text-white/80" strokeWidth={1.6} />
        <span>
          <span className="block text-[11px] text-white/50">Adicionar</span>
          <span className="block text-[17px] font-semibold">Despesa</span>
        </span>
      </div>
      <div className={base}>
        <PlusCircle className="ml-auto size-6 text-[#FF6A1A]" strokeWidth={1.6} />
        <span>
          <span className="block text-[11px] text-white/50">Adicionar</span>
          <span className="block text-[17px] font-semibold text-[#FF6A1A]">Receita</span>
        </span>
      </div>
      <div className={base}>
        <CheckCircle2 className="ml-auto size-6 text-white/80" strokeWidth={1.6} />
        <span>
          <span className="block text-[11px] text-white/50">Ver</span>
          <span className="block text-[17px] font-semibold">Transações</span>
        </span>
      </div>
    </div>
  );
}

export function BlocoCategorias() {
  return (
    <Cartao className="absolute inset-x-5 p-5">
      <p className="text-[16px] font-semibold">Gastos por categoria</p>
      <div className="mt-4 flex h-[150px] items-end gap-2">
        {CATEGORIAS.map((c) => (
          <div key={c.nome} className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[18px] bg-white/[0.05]">
            <span className="relative z-10 pt-2 text-center text-[11px] text-white/60">{c.pct}%</span>
            <span
              data-bar
              className="absolute inset-x-0 bottom-0 origin-bottom rounded-[16px]"
              style={{ height: `${c.pct}%`, background: c.cor }}
            />
          </div>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {CATEGORIAS.slice(0, 4).map((c) => (
          <li key={c.nome} className="flex items-center gap-2 text-[12px]">
            <span className="size-2.5 rounded-[4px]" style={{ background: c.cor }} />
            <span className="flex-1 text-white/85">{c.nome}</span>
            <span className="tabular-nums text-white/50">{c.valor}</span>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}

/* --- Telas --- */

/** Início (dashboard mobile). Mais alto que a tela: a timeline rola o conteúdo. */
export function ScreenDashboard() {
  return (
    <div className="relative h-full overflow-hidden bg-[#050505] text-white">
      <div data-dash-scroll className="relative" style={{ height: 1180 }}>
        <BlocoTopo />
        <div className="absolute inset-x-0" style={{ top: BLOCOS.resumo.top }}>
          <BlocoResumo />
        </div>
        <div className="absolute inset-x-0" style={{ top: BLOCOS.atalhos.top }}>
          <BlocoAtalhos />
        </div>
        <div className="absolute inset-x-0" style={{ top: BLOCOS.categorias.top }}>
          <BlocoCategorias />
        </div>
      </div>
    </div>
  );
}

const LANCAMENTOS = [
  { nome: "Supermercado", cat: "Alimentação", data: "24/09/2026", valor: "-R$ 284,90", status: "Paga", ok: true, icone: ShoppingBasket, cor: "#F5B544" },
  { nome: "Salário", cat: "Salário", data: "05/09/2026", valor: "R$ 9.200,00", status: "Recebida", ok: true, icone: Briefcase, cor: "#34D399", entrada: true },
  { nome: "Aluguel", cat: "Moradia", data: "05/09/2026", valor: "-R$ 2.050,00", status: "Paga", ok: true, icone: House, cor: "#FF8A4C" },
  { nome: "Posto Ipiranga", cat: "Transporte", data: "22/09/2026", valor: "-R$ 210,00", status: "Não paga", ok: false, icone: Car, cor: "#7DD3FC" },
  { nome: "Restaurante", cat: "Alimentação", data: "23/09/2026", valor: "-R$ 86,40", status: "Paga", ok: true, icone: Utensils, cor: "#F5B544" },
  { nome: "Farmácia Central", cat: "Saúde", data: "20/09/2026", valor: "-R$ 67,90", status: "Paga", ok: true, icone: HeartPulse, cor: "#86EFAC" },
];

/** Transações, com totais, filtros e a lista de lançamentos. */
export function ScreenTransactions() {
  return (
    <div className="relative h-full overflow-hidden bg-[#050505] text-white">
      <div data-tx-scroll className="px-5">
        <div className="-mx-5">
          <StatusBar />
        </div>
        <Pilulas />
        <h1 className="mt-5 text-[34px] font-medium leading-tight tracking-[-0.035em]">Transações</h1>
        <p className="mt-1 text-[14px] text-white/55">Gerencie todas as suas transações</p>
        <Periodo className="mt-4 border border-white/10 bg-[#111] text-white" />
        <span className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-[#FF6A1A] text-[14px] font-semibold text-[#140800]">
          <Plus className="size-4" />
          Nova Transação
        </span>

        <Cartao className="mt-4 divide-y divide-white/[0.07] px-5 py-1">
          {[
            { r: "Total de receitas", v: "R$ 9.200,00", t: "text-[#34D399]" },
            { r: "Total de despesas", v: "R$ 5.412,30", t: "text-[#FF5C5C]" },
            { r: "Total líquido", v: "R$ 3.787,70", t: "text-white" },
          ].map((l) => (
            <div key={l.r} className="py-3">
              <p className="text-[13px] text-white/55">{l.r}</p>
              <p className={cn("text-[24px] font-medium tracking-[-0.03em] tabular-nums", l.t)}>{l.v}</p>
            </div>
          ))}
        </Cartao>

        <p className="mt-4 flex items-center gap-2 text-[14px] font-medium">
          Filtros
          <span className="flex size-5 items-center justify-center rounded-full bg-[#FF6A1A] text-[11px] font-bold text-[#140800]">
            1
          </span>
        </p>
        <span className="mt-2 flex h-12 items-center gap-2 rounded-full border border-white/10 bg-[#1b1b1b] px-5 text-[14px] text-white/45">
          <Search className="size-4" />
          Buscar transações...
        </span>

        <Cartao className="mt-3 overflow-hidden pb-2">
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <span className="text-[16px] font-semibold">Lançamentos</span>
            <span className="flex gap-1 rounded-full border border-white/10 bg-[#111] p-1 text-[12px]">
              <span className="rounded-full bg-[#FF6A1A] px-3 py-1.5 font-semibold text-[#140800]">Todas</span>
              <span className="px-2.5 py-1.5 text-white/55">Receitas</span>
              <span className="px-2.5 py-1.5 text-white/55">Despesas</span>
            </span>
          </div>
          <ul className="space-y-1 px-3">
            {LANCAMENTOS.map((l) => {
              const Icone = l.icone;
              return (
                <li key={l.nome} data-row className="flex items-center gap-3 rounded-[22px] px-2.5 py-2.5">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${l.cor}22`, color: l.cor }}
                  >
                    <Icone className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{l.nome}</p>
                    <p className="truncate text-[12px] text-white/50">
                      {l.cat} · {l.data}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        l.ok
                          ? "border-[#34D399]/25 bg-[#34D399]/10 text-[#34D399]"
                          : "border-[#F5B544]/25 bg-[#F5B544]/10 text-[#F5B544]",
                      )}
                    >
                      {l.status}
                    </span>
                  </div>
                  <span className={cn("text-[15px] font-semibold tabular-nums", l.entrada ? "text-[#34D399]" : "text-[#FF5C5C]")}>
                    {l.valor}
                  </span>
                </li>
              );
            })}
          </ul>
        </Cartao>
      </div>
    </div>
  );
}

const METAS = [
  { nome: "Viagem para o Chile", pct: 68, meta: "R$ 10.000,00", guardado: "R$ 6.800,00", prazo: "30/04/2027", resta: "Restam 7 meses", mes: "R$ 457,14", cor: "#FF8A4C" },
  { nome: "Reserva de emergência", pct: 42, meta: "R$ 20.000,00", guardado: "R$ 8.400,00", prazo: "31/12/2027", resta: "Restam 15 meses", mes: "R$ 773,33", cor: "#86EFAC" },
];

/** Metas: cartão "Nova meta" em degradê e metas com régua de progresso. */
export function ScreenGoals() {
  return (
    <div className="relative h-full overflow-hidden bg-[#050505] px-5 text-white">
      <div className="-mx-5">
        <StatusBar />
      </div>
      <Pilulas />
      <h1 className="mt-5 text-[34px] font-medium leading-tight tracking-[-0.035em]">Metas</h1>
      <p className="mt-1 text-[14px] text-white/55">Acompanhe seus objetivos financeiros</p>

      <div className="brand-gradient mt-5 flex items-center justify-between rounded-[28px] px-5 py-5">
        <span>
          <span className="block text-[12px] opacity-70">Adicionar</span>
          <span className="block text-[21px] font-semibold tracking-tight">Nova meta</span>
        </span>
        <PlusCircle className="size-7" strokeWidth={1.5} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-[20px] font-medium tracking-tight">Lista de metas</span>
        <span className="flex gap-0.5 rounded-full border border-white/10 bg-[#111] p-1 text-[11px]">
          <span className="rounded-full bg-[#FF6A1A] px-3 py-1.5 font-semibold text-[#140800]">Todas</span>
          <span className="px-2 py-1.5 text-white/55">Em andamento</span>
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {METAS.map((m) => (
          <Cartao key={m.nome} className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full" style={{ background: `${m.cor}22`, color: m.cor }}>
                <Target className="size-5" />
              </span>
              <div>
                <p className="text-[16px] font-semibold">{m.nome}</p>
                <p className="text-[12px] text-white/50">Em andamento</p>
              </div>
            </div>
            <div className="mt-4 border-t border-white/[0.07] pt-4">
              <p className="text-[12px] text-white/50">Progresso</p>
              <div className="relative mt-2 h-4 text-[10px] text-white/50">
                <span className="absolute left-0">0%</span>
                <span className="absolute -translate-x-1/2 text-[12px] font-semibold text-white" style={{ left: `${m.pct}%` }}>
                  {m.pct}%
                </span>
                <span className="absolute right-0">100%</span>
              </div>
              <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  data-goalbar
                  className="h-full origin-left rounded-full bg-[linear-gradient(90deg,#FF6A1A,#F5A524)]"
                  style={{ width: `${m.pct}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
                <div>
                  <p className="text-white/50">Meta</p>
                  <p className="mt-0.5 text-[13px] font-semibold tabular-nums">{m.meta}</p>
                </div>
                <div>
                  <p className="text-white/50">Guardado</p>
                  <p className="mt-0.5 text-[13px] font-semibold tabular-nums">{m.guardado}</p>
                </div>
                <div>
                  <p className="text-white/50">Prazo</p>
                  <p className="mt-0.5 text-[13px] font-semibold tabular-nums">{m.prazo}</p>
                  <p className="text-[10px] text-white/45">{m.resta}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-full border border-white/[0.07] bg-white/[0.04] py-1.5 pl-4 pr-1.5">
              <span className="text-[12px] text-white/55">
                <span className="font-semibold text-white">{m.mes}</span>/mês
              </span>
              <span className="flex h-9 items-center gap-1 rounded-full bg-[#FF6A1A] px-4 text-[13px] font-semibold text-[#140800]">
                <Plus className="size-3.5" />
                Aportar
              </span>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}

const RECEITAS_MES = [
  { mes: "Abr", v: 68 },
  { mes: "Mai", v: 74 },
  { mes: "Jun", v: 71 },
  { mes: "Jul", v: 82 },
  { mes: "Ago", v: 89 },
  { mes: "Set", v: 92 },
];

/** Análises: visão geral com métricas, evolução das receitas e categorias. */
export function ScreenAnalytics() {
  return (
    <div className="relative h-full overflow-hidden bg-[#050505] px-5 text-white">
      <div className="-mx-5">
        <StatusBar />
      </div>
      <Pilulas />
      <h1 className="mt-5 text-[34px] font-medium leading-tight tracking-[-0.035em]">Análises</h1>
      <p className="mt-1 text-[14px] text-white/55">Análises detalhadas das suas finanças</p>
      <Periodo className="mt-4 border border-white/10 bg-[#111] text-white" />

      <div className="mt-4 flex gap-1 overflow-hidden rounded-full border border-white/10 bg-[#111] p-1 text-[13px]">
        <span className="shrink-0 rounded-full bg-[#FF6A1A] px-4 py-2 font-semibold text-[#140800]">Visão Geral</span>
        <span className="shrink-0 px-3 py-2 text-white/55">Fluxo de Caixa</span>
        <span className="shrink-0 px-3 py-2 text-white/55">Categorias</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { r: "Receitas Totais", v: "R$ 9.200,00", x: "+3,4%", bom: true },
          { r: "Despesas Totais", v: "R$ 5.412,30", x: "−6,9%", bom: true },
          { r: "Ticket Médio", v: "R$ 180,41", x: "−2,1%", bom: true },
          { r: "Transações", v: "30", x: "+7,1%", bom: true },
        ].map((c) => (
          <Cartao key={c.r} className="p-4">
            <p className="text-[12px] text-white/55">{c.r}</p>
            <p className="mt-1.5 text-[20px] font-medium tracking-[-0.03em] tabular-nums">{c.v}</p>
            <div className="mt-1.5">
              <Variacao valor={c.x} bom={c.bom} />
            </div>
          </Cartao>
        ))}
      </div>

      <Cartao className="mt-3 p-5">
        <p className="text-[16px] font-semibold">Evolução das Receitas</p>
        <div className="mt-4 flex h-[150px] items-end justify-between gap-3 border-b border-dashed border-white/10 pb-1">
          {RECEITAS_MES.map((b) => (
            <div key={b.mes} className="flex h-full flex-1 items-end">
              <span data-bar className="w-full origin-bottom rounded-[10px] bg-[#FF6A1A]" style={{ height: `${b.v}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-white/50">
          {RECEITAS_MES.map((b) => (
            <span key={b.mes} className="flex-1 text-center">
              {b.mes}
            </span>
          ))}
        </div>
      </Cartao>
    </div>
  );
}

/**
 * Vista explodida do início: os mesmos blocos, nas mesmas posições, como
 * camadas independentes que a timeline separa no eixo Z. `data-z` é a
 * distância final de cada camada.
 */
export function ExplodedDashboard() {
  return (
    <>
      <div data-layer data-z="0" className="absolute inset-0 rounded-[58px] bg-[#050505]" />
      <div data-layer data-z="60" className="absolute inset-0">
        <BlocoTopo comSaldo={false} />
      </div>
      <div data-layer data-z="130" className="absolute inset-0">
        <BlocoSaldo />
      </div>
      <div data-layer data-z="95" className="absolute inset-x-0" style={{ top: BLOCOS.resumo.top }}>
        <BlocoResumo />
      </div>
      <div data-layer data-z="160" className="absolute inset-x-0" style={{ top: BLOCOS.atalhos.top }}>
        <BlocoAtalhos />
      </div>
      <div
        data-layer
        data-z="120"
        className="absolute inset-x-0 overflow-hidden"
        style={{ top: BLOCOS.categorias.top, height: 932 - BLOCOS.categorias.top }}
      >
        <BlocoCategorias />
      </div>
    </>
  );
}
