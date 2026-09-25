"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUpRight, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { sairDaConta } from "@/components/layout/logout";
import { primaryNavItems, secondaryNavItems, type NavItem } from "@/components/layout/nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useProfile } from "@/hooks/use-nexosgen-nexosfinn";
import { cn } from "@/lib/utils";

function Bloco({ item, ativo, indice }: { item: NavItem; ativo: boolean; indice: number }) {
  const Icon = item.icon;

  return (
    <DialogPrimitive.Close asChild>
      <Link
        href={item.href}
        prefetch={false}
        aria-current={ativo ? "page" : undefined}
        className={cn(
          "flex min-h-[104px] flex-col justify-between rounded-[26px] border p-4 transition-[transform,background-color,border-color] duration-300 ease-out-expo active:scale-[0.97]",
          ativo
            ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_14px_36px_-16px_hsl(var(--primary)/0.9)]"
            : "border-border/80 bg-card text-foreground",
        )}
        style={{ animation: `nf-rise 520ms var(--ease-out-expo) ${80 + indice * 35}ms both` }}
      >
        <span className="flex items-start justify-between">
          <Icon className={cn("size-5", ativo ? "text-primary-foreground" : "text-primary")} />
          <ArrowUpRight className={cn("size-4", ativo ? "text-primary-foreground/70" : "text-muted-foreground")} />
        </span>
        <span>
          <span className={cn("block text-[11px]", ativo ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {ativo ? "Você está aqui" : "Ir para"}
          </span>
          <span className="block text-base font-semibold tracking-tight">{item.label}</span>
        </span>
      </Link>
    </DialogPrimitive.Close>
  );
}

/**
 * Menu do celular em tela cheia.
 *
 * Substitui a antiga barra fixa na base: no celular não há faixa fixa em cima
 * nem embaixo, a página rola de ponta a ponta. Os oito destinos viram blocos
 * grandes, fáceis de tocar, com a mesma linguagem dos atalhos do início.
 *
 * Feito sobre o Dialog do Radix para ganhar de graça o foco preso, o Esc e o
 * bloqueio de rolagem do fundo. Só há animação de entrada — a de saída deixa
 * o Radix preso no DOM nesta combinação de versões (ver ui/dialog.tsx).
 */
export function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useProfile();
  const [saindo, setSaindo] = useState(false);

  // Navegar fecha o menu, inclusive por voltar/avançar do navegador.
  useEffect(() => {
    onOpenChange(false);
  }, [pathname]);

  const primeiroNome = user?.name?.split(" ")[0];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=open]:fade-in-0 lg:hidden" />
        <DialogPrimitive.Content
          className="no-scrollbar fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-background px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(0.75rem+env(safe-area-inset-top,0px))] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 data-[state=open]:duration-300 lg:hidden"
          aria-describedby={undefined}
        >
          <div className="mx-auto w-full max-w-md sm:max-w-2xl">
            <div className="flex h-12 items-center justify-between">
              <DialogPrimitive.Close
                className="flex h-11 w-16 items-center justify-center rounded-full border border-border/80 bg-card text-foreground"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
              <ThemeToggle />
            </div>

            <div className="mt-7 px-1">
              <Logo priority />
              <DialogPrimitive.Title className="mt-5 text-[2rem] font-medium leading-tight tracking-[-0.03em]">
                {primeiroNome ? (
                  <>
                    Olá, <span className="font-semibold">{primeiroNome}</span>
                  </>
                ) : (
                  "Menu"
                )}
              </DialogPrimitive.Title>
              <p className="mt-1 text-sm text-muted-foreground">Para onde você quer ir?</p>
            </div>

            <p className="mt-7 px-1 text-xs font-medium text-muted-foreground">Principal</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {primaryNavItems.map((item, indice) => (
                <Bloco key={item.href} item={item} ativo={pathname.startsWith(item.href)} indice={indice} />
              ))}
            </div>

            <p className="mt-6 px-1 text-xs font-medium text-muted-foreground">Gerenciar</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {secondaryNavItems.map((item, indice) => (
                <Bloco
                  key={item.href}
                  item={item}
                  ativo={pathname.startsWith(item.href)}
                  indice={primaryNavItems.length + indice}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={async () => {
                setSaindo(true);
                await sairDaConta(router);
              }}
              disabled={saindo}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-destructive/25 bg-destructive/10 text-sm font-semibold text-destructive transition-colors disabled:opacity-60"
            >
              <LogOut className="size-4" />
              {saindo ? "Saindo..." : "Sair da conta"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
