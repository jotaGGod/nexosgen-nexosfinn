"use client";

import { usePathname } from "next/navigation";

/**
 * Entrada por tela.
 *
 * A cada navegação o conteúdo aparece num fade curto; o movimento fica por
 * conta dos blocos de cada tela (.stagger), que sobem escalonados. O casco em
 * si só muda opacidade — se ele se deslocasse, o topo em degradê do início
 * abriria uma faixa no alto da tela durante a animação.
 *
 * A chave por rota força o remonte, então a entrada toca de novo ao trocar de
 * seção. Quem pediu menos movimento no sistema não vê nada disso: o
 * `prefers-reduced-motion` global zera a duração.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-[nf-fade_420ms_ease-out_both]">
      {children}
    </div>
  );
}
