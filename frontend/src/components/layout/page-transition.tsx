"use client";

import { usePathname } from "next/navigation";

/**
 * Entrada orquestrada por tela.
 *
 * A cada navegação o conteúdo sobe e aparece uma vez — a "entrada única por
 * página" que o design system pede. A chave por rota força o remonte, então a
 * animação toca de novo ao trocar de seção. Quem pediu menos movimento no
 * sistema operacional não vê nada disso: o `prefers-reduced-motion` global já
 * zera a duração.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-rise-in">
      {children}
    </div>
  );
}
