"use client";

import { Blocks, LogOut, SlidersHorizontal, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
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

/** Controles globais do app, fixados no mesmo eixo visual dos títulos no desktop. */
export function AppHeader() {
  const router = useRouter();
  const { data: user } = useProfile();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Uma falha de rede não pode prender o usuário no app.
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="relative z-40 flex items-center justify-between gap-3 lg:absolute lg:right-8 lg:top-8 lg:justify-end">
      <Link href="/app/dashboard" aria-label="Ir para o início" className="lg:hidden">
        <Logo />
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative size-11 overflow-hidden rounded-full border border-border bg-card shadow-card outline-none transition hover:border-active/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Abrir menu do perfil"
            >
              <Image
                src="/images/default-user-avatar.svg"
                alt={user ? `Foto de ${user.name}` : "Foto do usuário"}
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl p-2">
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
      </div>
    </header>
  );
}
