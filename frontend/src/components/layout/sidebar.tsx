"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { primaryNavItems, secondaryNavItems, type NavItem } from "@/components/layout/nav";
import { useProfile } from "@/hooks/use-nexosgen-nexosfinn";
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
        "relative flex min-h-11 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out-expo",
        ativo
          ? // Claro: chip escuro para o limão neon poder aparecer. Escuro:
            // véu do próprio limão sobre o fundo quase preto.
            "bg-nav-active text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.22)] dark:bg-primary/[0.12] dark:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.14)]"
          : "text-muted-foreground hover:translate-x-0.5 hover:bg-secondary/80 hover:text-foreground",
      )}
    >
      {/* Trilho de marca no item ativo — o sinal "você está aqui". */}
      <span
        aria-hidden
        className={cn(
          "absolute left-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-primary transition-opacity duration-200",
          ativo ? "opacity-100 shadow-[0_0_10px_hsl(var(--primary)/0.8)]" : "opacity-0",
        )}
      />
      <Icon className="size-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useProfile();
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
    <aside className="glass-panel sticky top-3 hidden h-[calc(100dvh-1.5rem)] w-64 shrink-0 flex-col rounded-[28px] px-4 py-5 lg:flex">
      <Link href="/app/dashboard" prefetch={false} aria-label="Ir para o início" className="flex items-center justify-between px-3 py-1">
        <Logo size="lg" />
        <span className="size-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]" aria-label="Sistema online" />
      </Link>

      <nav className="mt-7 flex flex-1 flex-col gap-1" aria-label="Navegação principal">
        {primaryNavItems.map((item) => (
          <ItemDaLista key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}

        <span className="mt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
          Gerenciar
        </span>

        {secondaryNavItems.map((item) => (
          <ItemDaLista key={item.href} item={item} ativo={pathname.startsWith(item.href)} />
        ))}
      </nav>

      {/*
       * Zona compacta de usuário: preenche o espaço entre a navegação e a saída
       * com identidade — quem está logado — em vez de deixar um vão vazio.
       */}
      <div className="mt-4 space-y-1 border-t border-sidebar-border/70 pt-3">
        <Link
          href="/app/configuracoes?tab=perfil"
          prefetch={false}
          className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-secondary/70"
        >
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full border border-border bg-card">
            <Image
              src="/images/default-user-avatar.svg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {user?.name ?? "Minha conta"}
            </span>
            {user?.email ? (
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            ) : null}
          </span>
        </Link>

        <button
          type="button"
          onClick={sair}
          disabled={saindo}
          className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          <LogOut className="size-[18px] shrink-0" />
          {saindo ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </aside>
  );
}
