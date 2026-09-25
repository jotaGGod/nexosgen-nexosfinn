import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  ChevronDown,
  House,
  Moon,
  Plus,
  PlusCircle,
  ShoppingBasket,
  SlidersHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { CATEGORIAS } from "@/components/landing/app-screens";
import { primaryNavItems, secondaryNavItems } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Prévia do painel desktop real da NexosFinn para a página de vendas.
 *
 * Réplica fiel da tela /app/dashboard no computador: a barra superior em
 * pílulas (os mesmos destinos, importados de nav.ts), o título "Olá, Nome",
 * o seletor de período e "Nova transação", o painel de Receitas / Despesas /
 * Economia com as barras de proporção, o cartão de Saldo total, o Fluxo de
 * caixa em barras, Gastos por categoria em colunas, Transações recentes e
 * Metas. Mesmos rótulos e componentes do app; valores ilustrativos.
 *
 * Desenhada numa largura fixa de 1280px e escalada por fora pelo contêiner,
 * para caber em qualquer tela sem se reorganizar — é uma "foto" do app.
 */

const FLUXO = [
  { mes: "Abr", r: 6.8, d: 5.9 },
  { mes: "Mai", r: 7.4, d: 6.1 },
  { mes: "Jun", r: 7.1, d: 5.2 },
  { mes: "Jul", r: 8.2, d: 6.4 },
  { mes: "Ago", r: 8.9, d: 5.8 },
  { mes: "Set", r: 9.2, d: 5.4 },
];

function Variacao({ valor, bom = true }: { valor: string; bom?: boolean }) {
  const Icone = valor.startsWith("+") ? TrendingUp : TrendingDown;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[12px]">
      <span className={cn("flex items-center gap-1 font-semibold", bom ? "text-[#34D399]" : "text-[#FF5C5C]")}>
        <Icone className="size-3.5" />
        {valor}
      </span>
      <span className="text-white/50">vs mês anterior</span>
    </p>
  );
}

function Painel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[28px] border border-white/[0.08] bg-[#111111]", className)}>{children}</div>;
}

function Metrica({
  rotulo,
  valor,
  variacao,
  bom = true,
  barra,
  legenda,
  destaque,
}: {
  rotulo: string;
  valor: string;
  variacao: string;
  bom?: boolean;
  barra: number;
  legenda: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col px-7 first:pl-0 last:pr-0">
      <p className="text-[13px] text-white/55">{rotulo}</p>
      <p className="mt-2 text-[30px] font-medium leading-tight tracking-[-0.03em] tabular-nums">{valor}</p>
      <Variacao valor={variacao} bom={bom} />
      <div className="mt-auto pt-7">
        <div className="mb-2 flex justify-between text-[11px] text-white/50">
          <span>{legenda}</span>
          <span className="tabular-nums">{barra}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={cn(
              "h-full rounded-full",
              destaque ? "stripes bg-[linear-gradient(90deg,#FF6A1A,#F5A524)]" : "bg-white/25",
            )}
            style={{ width: `${barra}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  const maximo = 10;

  return (
    <div className="w-[1280px] rounded-[32px] border border-white/10 bg-[#050505] p-6 text-white shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)]">
      {/* Barra superior em pílulas, como no app. */}
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-12 items-center gap-2 rounded-full border border-white/[0.08] bg-[#111] px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nexosfinn-logo-dark.png" alt="" className="h-[26px] w-auto" />
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#111] p-1">
            {primaryNavItems.map((item, indice) => {
              const Icone = item.icon;
              return (
                <span
                  key={item.href}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium",
                    indice === 0 ? "bg-[#FF6A1A] font-semibold text-[#140800]" : "text-white/55",
                  )}
                >
                  <Icone className="size-4" />
                  {item.label}
                </span>
              );
            })}
          </div>
          {secondaryNavItems.map((item) => {
            const Icone = item.icon;
            return (
              <span
                key={item.href}
                className="flex size-12 items-center justify-center rounded-full border border-white/[0.08] bg-[#111] text-white/55"
              >
                <Icone className="size-[18px]" />
              </span>
            );
          })}
        </div>

        <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#111] p-1">
          <span className="flex size-11 items-center justify-center rounded-full border border-white/[0.08] text-white/55">
            <Moon className="size-[18px]" />
          </span>
          <span className="flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FF6A1A,#F5A524)] text-[12px] font-bold text-[#140800]">
            AL
          </span>
        </span>
      </div>

      {/* Título e ações. */}
      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-[52px] font-medium leading-[1.1] tracking-[-0.035em]">
            Olá, <span className="font-semibold">Ana</span>
          </p>
          <p className="mt-2 text-[15px] text-white/55">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-11 items-center gap-3 rounded-full border border-white/[0.08] bg-[#111] px-5 text-[13px] font-semibold">
            <CalendarDays className="size-4 text-[#FF6A1A]" />
            Setembro de 2026
            <ChevronDown className="size-4 text-white/50" />
          </span>
          <span className="flex size-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#111] text-white/70">
            <SlidersHorizontal className="size-4" />
          </span>
          <span className="flex h-11 items-center gap-2 rounded-full bg-[#FF6A1A] px-5 text-[13px] font-semibold text-[#140800]">
            <Plus className="size-4" />
            Nova transação
          </span>
        </div>
      </div>

      {/* Resumo: painel largo + saldo. */}
      <div className="mt-6 grid grid-cols-12 gap-4">
        <Painel className="col-span-8 flex p-7">
          <div className="grid w-full grid-cols-3 divide-x divide-white/[0.07]">
            <Metrica rotulo="Receitas" valor="R$ 9.200,00" variacao="+3,4%" barra={100} legenda="Entradas do período" destaque />
            <Metrica rotulo="Despesas" valor="R$ 5.412,30" variacao="−6,9%" barra={59} legenda="Da receita gasta" />
            <Metrica rotulo="Economia" valor="R$ 3.787,70" variacao="+18,2%" barra={41} legenda="Taxa de poupança" />
          </div>
        </Painel>
        <Painel className="relative col-span-4 flex flex-col overflow-hidden p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-[radial-gradient(circle,rgba(255,106,26,0.28),transparent_65%)]" />
          <div className="relative flex items-start justify-between">
            <p className="text-[13px] text-white/55">Saldo total</p>
            <span className="flex size-10 items-center justify-center rounded-full border border-white/[0.08] text-white/55">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
          <p className="relative mt-2 text-[40px] font-medium leading-tight tracking-[-0.035em] tabular-nums">R$ 7.580,50</p>
          <div className="relative">
            <Variacao valor="+12,5%" />
          </div>
          <div className="relative mt-auto flex gap-2 pt-7">
            <span className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[13px] font-semibold text-[#0A0A0A]">
              <PlusCircle className="size-4" />
              Nova transação
            </span>
            <span className="flex h-11 items-center rounded-full border border-white/[0.08] px-5 text-[13px] font-semibold">
              Contas
            </span>
          </div>
        </Painel>
      </div>

      {/* Fluxo de caixa + categorias. */}
      <div className="mt-4 grid grid-cols-12 gap-4">
        <Painel className="col-span-8 p-6">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold">Fluxo de caixa</p>
            <div className="flex items-center gap-4 text-[12px] text-white/55">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#FF6A1A]" /> Receitas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-white/30" /> Despesas
              </span>
            </div>
          </div>
          <div className="mt-5 flex h-[190px] items-end gap-6 border-b border-dashed border-white/10 pl-12">
            {FLUXO.map((ponto) => (
              <div key={ponto.mes} className="flex h-full flex-1 items-end justify-center gap-1.5">
                <span data-bar className="w-[18px] origin-bottom rounded-[9px] bg-[#FF6A1A]" style={{ height: `${(ponto.r / maximo) * 100}%` }} />
                <span data-bar className="w-[18px] origin-bottom rounded-[9px] bg-white/25" style={{ height: `${(ponto.d / maximo) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-6 pl-12 text-[12px] text-white/50">
            {FLUXO.map((ponto) => (
              <span key={ponto.mes} className="flex-1 text-center">
                {ponto.mes}
              </span>
            ))}
          </div>
        </Painel>

        <Painel className="col-span-4 p-6">
          <p className="text-[15px] font-semibold">Gastos por categoria</p>
          <div className="mt-5 flex h-[150px] items-end gap-2">
            {CATEGORIAS.map((c) => (
              <div key={c.nome} className="relative flex h-full flex-1 flex-col overflow-hidden rounded-[18px] bg-white/[0.05]">
                <span className="relative z-10 pt-2 text-center text-[11px] text-white/60">{c.pct}%</span>
                <span data-bar className="absolute inset-x-0 bottom-0 origin-bottom rounded-[16px]" style={{ height: `${c.pct}%`, background: c.cor }} />
              </div>
            ))}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
            {CATEGORIAS.slice(0, 4).map((c) => (
              <li key={c.nome} className="flex items-center gap-2 text-[12px]">
                <span className="size-2.5 rounded-[4px]" style={{ background: c.cor }} />
                <span className="flex-1 truncate text-white/85">{c.nome}</span>
                <span className="tabular-nums text-white/50">{c.valor}</span>
              </li>
            ))}
          </ul>
        </Painel>
      </div>

      {/* Transações recentes + metas. */}
      <div className="mt-4 grid grid-cols-12 gap-4">
        <Painel className="col-span-8 p-6">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold">Transações recentes</p>
            <span className="rounded-full border border-white/[0.08] px-4 py-2 text-[12px] font-semibold">Ver todas</span>
          </div>
          <ul className="mt-3 space-y-1">
            {[
              { nome: "Supermercado", cat: "Alimentação", quando: "Hoje", valor: "-R$ 284,90", icone: ShoppingBasket, cor: "#F5B544" },
              { nome: "Salário", cat: "Salário", quando: "05 set", valor: "R$ 9.200,00", icone: Briefcase, cor: "#34D399", entrada: true },
              { nome: "Aluguel", cat: "Moradia", quando: "05 set", valor: "-R$ 2.050,00", icone: House, cor: "#FF8A4C" },
            ].map((t) => {
              const Icone = t.icone;
              return (
                <li key={t.nome} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
                  <span className="flex size-11 items-center justify-center rounded-full" style={{ background: `${t.cor}22`, color: t.cor }}>
                    <Icone className="size-[18px]" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium">{t.nome}</p>
                    <p className="text-[12px] text-white/50">{t.cat}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-[14px] font-semibold tabular-nums", t.entrada ? "text-[#34D399]" : "text-[#FF5C5C]")}>{t.valor}</p>
                    <p className="text-[12px] text-white/50">{t.quando}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Painel>

        <Painel className="col-span-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold">Metas</p>
            <span className="rounded-full border border-white/[0.08] px-4 py-2 text-[12px] font-semibold">Ver todas</span>
          </div>
          <div className="mt-3 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-[14px] font-semibold">
              <Target className="size-4 text-[#FF8A4C]" />
              Viagem para o Chile
            </p>
            <div className="relative mt-3 h-4 text-[10px] text-white/50">
              <span className="absolute left-0">0%</span>
              <span className="absolute left-[68%] -translate-x-1/2 font-semibold text-white">68%</span>
              <span className="absolute right-0">100%</span>
            </div>
            <div className="mt-1.5 h-4 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#FF6A1A,#F5A524)]" />
            </div>
            <div className="mt-3 flex justify-between text-[12px]">
              <span>
                <span className="block text-white/50">Guardado</span>
                <span className="font-semibold tabular-nums">R$ 6.800,00</span>
              </span>
              <span className="text-right">
                <span className="block text-white/50">Meta</span>
                <span className="font-semibold tabular-nums">R$ 10.000,00</span>
              </span>
            </div>
          </div>
        </Painel>
      </div>
    </div>
  );
}
