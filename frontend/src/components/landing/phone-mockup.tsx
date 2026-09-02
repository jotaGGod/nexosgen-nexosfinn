import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Home,
  LayoutGrid,
  MessageCircle,
  Send,
  ShoppingBasket,
  Sparkles,
  Target,
  Utensils,
  WalletCards,
} from "lucide-react";
import Image from "next/image";

const transactions = [
  {
    label: "Supermercado",
    detail: "Alimentação · hoje",
    amount: "− R$ 284,90",
    icon: ShoppingBasket,
    color: "bg-primary/12 text-primary",
  },
  {
    label: "Restaurante",
    detail: "Alimentação · ontem",
    amount: "− R$ 86,40",
    icon: Utensils,
    color: "bg-accent/12 text-accent",
  },
];

function PhoneLogo() {
  return (
    <svg viewBox="0 0 32 32" className="size-5 shrink-0" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="phone-nexosfinn-mark" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C6FF3D" />
          <stop offset="1" stopColor="#297A52" />
        </linearGradient>
      </defs>
      <path d="M5 28V4h5l12 15.5V4h5v24h-5L10 12.5V28H5Z" fill="url(#phone-nexosfinn-mark)" />
    </svg>
  );
}

function PhoneScreen() {
  const navigation = [
    { label: "Início", icon: Home, active: true },
    { label: "Transações", icon: ArrowLeftRight },
    { label: "Análises", icon: BarChart3 },
    { label: "Metas", icon: Target },
    { label: "Mais", icon: LayoutGrid },
  ];

  return (
    <div className="absolute left-[9.5%] top-[8.2%] z-20 flex h-[84%] w-[81%] flex-col overflow-hidden rounded-[28px] bg-[#050505] text-white">
      <div className="flex items-center justify-between px-3 pt-1 text-[8px] font-bold text-zinc-200">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-2.5 rounded-sm bg-zinc-200" />
          <span className="h-1.5 w-2.5 rounded-sm bg-zinc-200" />
          <span className="h-1.5 w-4 rounded-sm border border-zinc-300" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-b border-white/10 px-3 pb-2.5">
        <div className="flex items-center gap-1.5">
          <PhoneLogo />
          <span className="text-[11px] font-bold tracking-tight">NexosFinn</span>
        </div>
        <Bell className="size-3.5 text-zinc-400" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-medium uppercase tracking-[0.14em] text-zinc-500">Saldo total</span>
            <WalletCards className="size-3 text-[#C6FF3D]" />
          </div>
          <p className="mt-1 text-[17px] font-bold tracking-tight tabular-nums">R$ 7.580,50</p>
          <p className="mt-0.5 text-[7px] font-semibold text-[#C6FF3D]">+12,5% no mês</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
          <div className="flex size-9 items-center justify-center rounded-full border border-[#C6FF3D]/30 bg-[#C6FF3D]/10 shadow-[0_0_24px_rgba(198,255,61,0.12)]">
            <Sparkles className="size-4 text-[#C6FF3D]" />
          </div>
          <p className="mt-2 text-[11px] font-semibold">Olá, eu sou a Nexo</p>
          <p className="mt-1 max-w-[150px] text-[8px] leading-relaxed text-zinc-500">
            O que você quer entender sobre seu dinheiro hoje?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <span className="rounded-full border border-white/10 px-2 py-1.5 text-center text-[6px] text-zinc-300">
            Resumo do mês
          </span>
          <span className="rounded-full border border-white/10 px-2 py-1.5 text-center text-[6px] text-zinc-300">
            Onde mais gastei?
          </span>
        </div>

        <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.055] p-2.5">
          <div className="flex items-center gap-1.5 text-[7px] font-semibold text-[#C6FF3D]">
            <MessageCircle className="size-3" />
            Insight da Nexo
          </div>
          <p className="mt-1.5 text-[7px] leading-relaxed text-zinc-300">
            Você gastou <strong className="text-white">R$ 905,25</strong> em alimentação — R$ 112,40 a menos que no mês passado.
          </p>
          <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1.5 pl-2 text-[6px] text-zinc-500">
            Pergunte sobre suas finanças
            <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-[#C6FF3D] text-black">
              <Send className="size-2.5" />
            </span>
          </div>
        </div>
      </div>

      <div className="mx-2 mb-1 grid grid-cols-5 rounded-2xl border border-white/10 bg-black/90 p-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.label}
              className={item.active ? "flex flex-col items-center gap-0.5 rounded-xl bg-[#C6FF3D]/10 py-1 text-[#C6FF3D]" : "flex flex-col items-center gap-0.5 py-1 text-zinc-600"}
            >
              <Icon className="size-3" />
              <span className="text-[4.5px] font-semibold">{item.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TransactionsCard() {
  return (
    <div className="absolute left-0 top-[205px] z-30 hidden w-[260px] xl:block">
      <div className="mb-3 flex items-center gap-2 px-1 text-sm font-medium text-muted-foreground">
        <CircleDollarSign className="size-4" />
        Últimas transações
      </div>
      <div className="space-y-2.5">
        {transactions.map((transaction) => {
          const Icon = transaction.icon;
          return (
            <div key={transaction.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card/90 p-3.5 shadow-card backdrop-blur-xl">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${transaction.color}`}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{transaction.label}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{transaction.detail}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground">{transaction.amount}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BudgetCard() {
  const bars = [36, 68, 48, 82, 58, 42, 71];

  return (
    <div className="absolute right-12 top-[370px] z-30 hidden w-[230px] xl:block">
      <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-card backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Orçamento do mês</p>
            <p className="mt-1 text-lg font-bold tracking-tight tabular-nums text-foreground">R$ 3.840</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-4 flex h-20 items-end justify-between gap-2 border-b border-border/70 pb-2">
          {bars.map((height, index) => (
            <div key={index} className="flex h-full flex-1 items-end">
              <span
                className={index < 5 ? "w-full rounded-full bg-primary" : "w-full rounded-full border border-dashed border-border"}
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[8px] text-muted-foreground">
          <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Limite utilizado</span>
            <span className="font-semibold tabular-nums text-foreground">76%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[76%] rounded-full bg-primary" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 px-1 text-sm font-medium text-muted-foreground">
        <Sparkles className="size-4 text-primary" />
        Insights financeiros
      </div>
    </div>
  );
}

function CompactCards() {
  return (
    <>
      <div className="absolute left-1 top-[165px] z-30 rounded-full border border-border bg-card/95 px-3 py-2 shadow-card backdrop-blur-xl xl:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/12 text-primary">
            <WalletCards className="size-3" />
          </span>
          <div>
            <p className="text-[8px] text-muted-foreground">Conta conectada</p>
            <p className="text-[9px] font-semibold text-foreground">Saldo atualizado</p>
          </div>
        </div>
      </div>

      <div className="absolute right-1 top-[335px] z-30 rounded-full border border-border bg-card/95 px-3 py-2 shadow-card backdrop-blur-xl xl:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent/12 text-accent">
            <Target className="size-3" />
          </span>
          <div>
            <p className="text-[8px] text-muted-foreground">Meta Viagem</p>
            <p className="text-[9px] font-semibold tabular-nums text-foreground">68% concluída</p>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Cena do produto inspirada na hierarquia da referência: aparelho central e
 * dados financeiros reais do produto transbordando para cartões laterais.
 */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[590px] w-full max-w-[430px] sm:h-[650px] sm:max-w-[620px] lg:h-[720px] xl:w-[700px] xl:max-w-none xl:-translate-x-10">
      <div className="pointer-events-none absolute left-1/2 top-12 size-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />

      <TransactionsCard />
      <BudgetCard />
      <CompactCards />

      <div className="absolute left-1/2 top-0 z-20 w-[270px] -translate-x-1/2 sm:w-[290px] lg:w-[340px]" style={{ aspectRatio: "685 / 1433" }}>
        <Image
          src="/images/nexosfinn-iphone-front-transparent-v2.png"
          alt=""
          fill
          priority
          unoptimized
          sizes="(max-width: 640px) 270px, (max-width: 1023px) 290px, 340px"
          className="object-contain drop-shadow-[0_36px_70px_rgba(0,0,0,0.5)]"
        />
        <PhoneScreen />
      </div>

      <span className="sr-only">
        Prévia do aplicativo NexosFinn com saldo, assistente financeiro, transações recentes e acompanhamento de orçamento.
      </span>
    </div>
  );
}
