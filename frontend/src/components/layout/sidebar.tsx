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
