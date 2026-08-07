"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:px-5 sm:pt-3">
      <div
        className={cn(
          "mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-full border px-4 transition-all duration-300 sm:px-5",
          rolou
            ? "border-border/80 bg-background/80 shadow-card backdrop-blur-2xl"
            : "border-transparent bg-background/20 backdrop-blur-sm",
        )}
      >
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

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary sm:hidden"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] max-[359px]:hidden sm:px-5 sm:text-sm"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
