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
        "flex min-h-11 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
        ativo
          ? "bg-active/[0.12] text-active shadow-[inset_0_0_0_1px_hsl(var(--active)/0.12)]"
          : "text-muted-foreground hover:translate-x-0.5 hover:bg-secondary/80 hover:text-foreground",
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

      <button
        type="button"
        onClick={sair}
        disabled={saindo}
        className="flex min-h-11 items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
      >
        <LogOut className="size-[18px] shrink-0" />
        {saindo ? "Saindo..." : "Sair da conta"}
      </button>
    </aside>
  );
}
