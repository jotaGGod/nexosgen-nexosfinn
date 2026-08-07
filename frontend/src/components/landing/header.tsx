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
        <Link href="/" aria-label="nexosgen-financehub, início">
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
