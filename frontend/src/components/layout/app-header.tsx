"use client";

import { Blocks, LogOut, SlidersHorizontal, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { sairDaConta } from "@/components/layout/logout";
import { primaryNavItems, secondaryNavItems } from "@/components/layout/nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-nexosgen-nexosfinn";
import { cn } from "@/lib/utils";

/** Avatar com o menu do perfil — o mesmo no celular e no desktop. */
function ProfileMenu({ pill = false }: { pill?: boolean }) {
  const router = useRouter();
  const { data: user } = useProfile();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    await sairDaConta(router);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative shrink-0 overflow-hidden border border-border/80 bg-card outline-none transition hover:border-primary/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            pill ? "h-11 w-16 rounded-full" : "size-11 rounded-full",
          )}
          aria-label="Abrir menu do perfil"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático; /_next/image dá 404 na Vercel. */}
          <img
            src="/images/default-user-avatar.svg"
            alt={user ? `Foto de ${user.name}` : "Foto do usuário"}
            className="absolute inset-0 size-full object-cover"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-3xl p-2">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block truncate text-sm font-semibold normal-case text-foreground">
            {user?.name ?? "Minha conta"}
          </span>
          {user?.email ? (
            <span className="mt-0.5 block truncate text-xs font-normal normal-case text-muted-foreground">
              {user.email}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/app/configuracoes?tab=perfil" prefetch={false}>
            <UserRound />
            Perfil e conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/configuracoes?tab=preferencias" prefetch={false}>
            <SlidersHorizontal />
            Preferências
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/configuracoes?tab=integracoes" prefetch={false}>
            <Blocks />
            Integrações
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          disabled={loggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void logout();
          }}
        >
          <LogOut />
          {loggingOut ? "Saindo..." : "Sair da conta"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Cabeçalho do app.
 *
 * Desktop (lg+): barra superior em pílulas — logo, os destinos principais com
 * rótulo numa pílula, os de uso ocasional como botões redondos de ícone e, à
 * direita, tema e perfil. Fica grudada no topo, mas sem faixa: só as pílulas
 * têm fundo (opaco, sem backdrop-filter, que custaria um desfoque por quadro
 * durante a rolagem), e o conteúdo passa por trás dos vãos.
 *
 * Celular: perfil e tema rolam junto com a página; os destinos ficam na
 * pílula flutuante da base, sem criar uma faixa de fundo na tela.
 */
export function AppHeader() {
  const pathname = usePathname();
  const { data: user } = useProfile();

  return (
    <>
      {/* Celular e tablet */}
      <header className="mobile-app-header relative z-40 flex h-12 items-center justify-between lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <ProfileMenu />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">Olá, {user?.name?.split(" ")[0] ?? "bem-vindo"}!</p>
            <p className="mobile-header-caption text-xs">Suas finanças, com clareza.</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Desktop */}
      <header className="sticky top-4 z-40 hidden items-center justify-between gap-4 lg:flex">
        <Link
          href="/app/dashboard"
          prefetch={false}
          aria-label="Ir para o início"
          className="flex h-12 items-center rounded-full border border-border/80 bg-card px-4"
        >
          <Logo priority />
        </Link>

        <nav className="flex items-center gap-2" aria-label="Navegação principal">
          <div className="flex items-center gap-1 rounded-full border border-border/80 bg-card p-1">
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
                    "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[background-color,color,box-shadow] duration-300 ease-out-expo",
                    ativo
                      ? "bg-primary font-semibold text-primary-foreground shadow-[0_8px_22px_-10px_hsl(var(--primary)/0.9)]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="hidden size-4 xl:block" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {secondaryNavItems.map((item) => {
            const ativo = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-label={item.label}
                title={item.label}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex size-12 items-center justify-center rounded-full border transition-[background-color,color,border-color] duration-300 ease-out-expo",
                  ativo
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : "border-border/80 bg-card text-muted-foreground hover:border-foreground/15 hover:text-foreground",
                )}
              >
                <Icon className="size-[18px]" />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card p-1">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </header>
    </>
  );
}
