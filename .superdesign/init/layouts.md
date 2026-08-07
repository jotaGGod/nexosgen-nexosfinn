# Shared layouts

## `frontend/src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { DomGuard } from "@/components/common/dom-guard";
import { ThemeProvider } from "@/components/common/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexosgen-nexosfinn.vercel.app"),
  title: {
    default: "NexosFinn — Suas finanças sob controle",
    template: "%s · NexosFinn",
  },
  description:
    "Acompanhe receitas e despesas, defina limites por categoria e alcance suas metas com um assistente que entende o seu dinheiro.",
  other: {
    // Impede que o Google Tradutor reescreva o conteúdo.
    //
    // A interface já é em pt-BR, então traduzir não agrega — e o tradutor
    // substitui os nós de texto no DOM por conta própria. Quando o React vai
    // reconciliar esses nós (ao inserir uma linha na lista depois de salvar,
    // por exemplo), ele não encontra mais o nó que criou e lança
    // "Failed to execute 'removeChild'", derrubando a aplicação inteira.
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitializer = `
  try {
    var storedTheme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = storedTheme === "light" ? "light" : "dark";
    var themeColor = theme === "dark" ? ${JSON.stringify(THEME_COLORS.dark)} : ${JSON.stringify(THEME_COLORS.light)};
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.backgroundColor = themeColor;
    document.querySelector('meta[name="color-scheme"]').setAttribute("content", theme);
    document.querySelector('meta[name="theme-color"]').setAttribute(
      "content",
      themeColor
    );
  } catch (_) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      translate="no"
      className={`dark notranslate ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content={THEME_COLORS.dark} />
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="min-h-dvh bg-background font-sans">
        <DomGuard />
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/app/app/layout.tsx`

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { REFRESH_TOKEN_COOKIE } from "@/lib/session";

/**
 * Casca das telas autenticadas.
 *
 * Dois layouts, um por classe de dispositivo:
 *
 * - Até `lg`: coluna única centrada e navegação fixa na base, dimensionadas
 *   pelo alcance do polegar.
 * - De `lg` em diante: barra lateral permanente e conteúdo largo. Manter a
 *   coluna de 448px no monitor desperdiçava a tela inteira — sobrava uma faixa
 *   estreita no meio com vazio dos dois lados.
 *
 * O limite de `max-w-7xl` existe porque linha de texto e tabela financeira
 * ficam ruins de ler quando esticam sem fim num monitor ultrawide; a partir
 * daí o conteúdo centraliza em vez de continuar crescendo.
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
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar />

      {/* min-w-0 para que uma tabela larga role dentro da área, e não empurre a lateral. */}
      <div className="min-w-0 flex-1">
        <div className="safe-area-page pb-nav mx-auto w-full max-w-md lg:max-w-7xl lg:pb-12">
          <AppHeader />
          <main className="mt-5 lg:mt-8">{children}</main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/app/(auth)/layout.tsx`

```tsx
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
          © {new Date().getFullYear()} NexosFinn
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

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/layout/logo.tsx`

```tsx
"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Marca NexosFinn: um "N" anguloso em degradê do limão de assinatura para o roxo
 * de apoio.
 *
 * Desenhada em SVG inline — não depende de arquivo externo, não gera
 * requisição e escala sem perda em qualquer tamanho.
 *
 * O identificador do gradiente vem de `useId` porque duas marcas convivem na
 * mesma página desde que existe barra lateral: uma nela e outra no cabeçalho.
 * Com um id fixo, os dois SVGs declaravam o mesmo `NexosFinn-mark`, e o
 * `fill="url(#NexosFinn-mark)"` de ambos resolvia para o primeiro do documento —
 * que é o da barra lateral, oculta com `display: none` no celular. O resultado
 * era o símbolo invisível no mobile, com o texto da marca aparecendo sozinho.
 *
 * É também o motivo de este componente ser de cliente: `useId` é um hook.
 */
export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const gradienteId = useId();

  const markSize = { sm: "size-6", md: "size-7", lg: "size-9" }[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className={cn(markSize, "shrink-0")} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradienteId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <path d="M5 28V4h5l12 15.5V4h5v24h-5L10 12.5V28H5Z" fill={`url(#${gradienteId})`} />
      </svg>

      {showWordmark ? (
        <span className={cn("font-semibold tracking-tight text-foreground", textSize)}>NexosFinn</span>
      ) : null}
    </div>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/layout/sidebar.tsx`

```tsx
"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { primaryNavItems, secondaryNavItems, type NavItem } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Navegação lateral do desktop.
 *
 * A barra inferior existe porque no celular o critério é o alcance do polegar.
 * No monitor esse critério não vale: sobra largura, o ponteiro chega em
 * qualquer canto, e esconder metade dos destinos atrás de uma gaveta seria
 * gastar espaço disponível para piorar a navegação. Aqui os oito destinos
 * ficam visíveis de uma vez, e a coluna some abaixo de `lg`, onde a barra
 * inferior assume.
 */
function ItemDaLista({ item, ativo }: { item: NavItem; ativo: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        ativo
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Servidor fora do ar não pode impedir o usuário de sair.
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card/40 px-4 py-6 lg:flex">
      <Link href="/app/dashboard" prefetch={false} aria-label="Ir para o início" className="px-3">
        <Logo />
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Navegação principal">
        {primaryNavItems.map((item) => (
          <ItemDaLista key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}

        <span className="mt-6 px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Gerenciar
        </span>

        {secondaryNavItems.map((item) => (
          <ItemDaLista key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}
      </nav>

      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
      >
        <LogOut className="size-[18px] shrink-0" />
        {saindo ? "Saindo..." : "Sair da conta"}
      </button>
    </aside>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/layout/app-header.tsx`

```tsx
"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Cabeçalho do aplicativo.
 *
 * Enxuto de propósito: com a navegação na barra inferior, o topo só precisa
 * carregar a marca e dois controles. Isso devolve altura vertical para o
 * conteúdo, que é o recurso escasso em tela de celular.
 *
 * No desktop a marca sai daqui — a barra lateral já a exibe, e repetir o mesmo
 * logo duas vezes na mesma tela não acrescenta nada. Sobram os controles,
 * alinhados à direita.
 */
export function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-3 lg:justify-end">
      <Link href="/app/dashboard" aria-label="Ir para o início" className="lg:hidden">
        <Logo />
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="size-[18px]" />
          <span
            className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/layout/bottom-nav.tsx`

```tsx
"use client";

import { LayoutGrid, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { primaryNavItems, secondaryNavItems } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

/**
 * Navegação inferior fixa, exclusiva de telas até `lg`.
 *
 * O critério de layout aqui é o alcance do polegar. De `lg` em diante quem
 * navega é a barra lateral, que mostra os oito destinos de uma vez — por isso
 * esta barra e sua gaveta somem por completo nesse ponto, em vez de coexistir
 * com a lateral.
 *
 * Quatro destinos diretos mais uma gaveta para o restante — cinco alvos é o
 * máximo que cabe confortavelmente na largura de um celular.
 */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [saindo, setSaindo] = useState(false);

  // Navegar fecha a gaveta, inclusive quando o usuário usa voltar/avançar.
  useEffect(() => {
    setGavetaAberta(false);
  }, [pathname]);

  // Trava a rolagem do fundo enquanto a gaveta cobre a tela.
  useEffect(() => {
    if (!gavetaAberta) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [gavetaAberta]);

  const gavetaAtiva = secondaryNavItems.some((item) => pathname.startsWith(item.href));

  async function sair() {
    setSaindo(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Servidor fora do ar não pode impedir o usuário de sair.
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {gavetaAberta ? (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setGavetaAberta(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Gaveta do "Mais" */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] transition-all duration-300 ease-out-expo lg:hidden",
          gavetaAberta ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
        role="dialog"
        aria-label="Mais seções"
        aria-hidden={!gavetaAberta}
      >
        <div className="surface overflow-hidden p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mais
            </span>
            <button
              type="button"
              onClick={() => setGavetaAberta(false)}
              className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Fechar"
              tabIndex={gavetaAberta ? 0 : -1}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {secondaryNavItems.map((item) => {
              const ativo = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  tabIndex={gavetaAberta ? 0 : -1}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    ativo
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            tabIndex={gavetaAberta ? 0 : -1}
            className="mt-1.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <LogOut className="size-[18px] shrink-0" />
            {saindo ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      </div>

      {/* Barra fixa */}
      <nav
        className="safe-area-nav fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-4 lg:hidden"
        aria-label="Navegação principal"
      >
        <div className="surface flex items-center justify-around gap-1 rounded-3xl p-1.5">
          {primaryNavItems.map((item) => {
            const ativo = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition-colors",
                  ativo
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-[19px]" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setGavetaAberta((aberta) => !aberta)}
            aria-expanded={gavetaAberta}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition-colors",
              gavetaAberta || gavetaAtiva
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-[19px]" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/layout/nav.ts`

```ts
import {
  ArrowLeftRight,
  BarChart3,
  Home,
  LayoutGrid,
  PieChart,
  Settings,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Destinos da barra inferior.
 *
 * São quatro porque, somados ao botão "Mais", ocupam cinco alvos de toque — o
 * limite confortável na largura de um celular. Estes quatro cobrem o uso
 * diário; o restante vive na gaveta.
 */
export const primaryNavItems: NavItem[] = [
  { href: "/app/dashboard", label: "Início", icon: Home },
  { href: "/app/transacoes", label: "Transações", icon: ArrowLeftRight },
  { href: "/app/relatorios", label: "Análises", icon: BarChart3 },
  { href: "/app/metas", label: "Metas", icon: Target },
];

/** Destinos de uso ocasional, abertos pelo botão "Mais". */
export const secondaryNavItems: NavItem[] = [
  { href: "/app/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/app/orcamentos", label: "Orçamentos", icon: PieChart },
  { href: "/app/contas", label: "Contas", icon: Wallet },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings },
];

export const navItems: NavItem[] = [...primaryNavItems, ...secondaryNavItems];

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/layout/page-header.tsx`

```tsx
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Controles da tela: seletor de período, botão de ação, etc. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Título de cada tela.
 *
 * Empilha por padrão: numa coluna estreita, título e controles lado a lado
 * espremeriam os dois. Deixou de ser componente de cliente ao perder o botão
 * de abrir a barra lateral — agora a navegação é a barra inferior.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

```

Shared shell or navigation used across one or more routes.

## `frontend/src/components/landing/header.tsx`

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const ancoras = [
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
  { href: "#seguranca", label: "Segurança" },
];

/**
 * Cabeçalho fixo da página de vendas.
 *
 * Ganha fundo e borda só depois que a rolagem começa: sobre o topo da página
 * ele fica transparente, para não cortar o hero com uma faixa horizontal.
 */
export function LandingHeader() {
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8);
    aoRolar();

    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        rolou ? "border-b border-border bg-background/80 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="NexosFinn, início">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Seções">
          {ancoras.map((ancora) => (
            <a
              key={ancora.href}
              href={ancora.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {ancora.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-2xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}

```

Shared shell or navigation used across one or more routes.
