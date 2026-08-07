"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Marca nexosgen-financehub: um "N" anguloso em degradê do limão de assinatura para o roxo
 * de apoio.
 *
 * Desenhada em SVG inline — não depende de arquivo externo, não gera
 * requisição e escala sem perda em qualquer tamanho.
 *
 * O identificador do gradiente vem de `useId` porque duas marcas convivem na
 * mesma página desde que existe barra lateral: uma nela e outra no cabeçalho.
 * Com um id fixo, os dois SVGs declaravam o mesmo `nexosgen-financehub-mark`, e o
 * `fill="url(#nexosgen-financehub-mark)"` de ambos resolvia para o primeiro do documento —
 * que é o da barra lateral, oculta com `display: none` no celular. O resultado
 * era o símbolo invisível no mobile, com o texto da marca aparecendo sozinho.
 *
 * É também o motivo de este componente ser de cliente: `useId` é um hook.
 */
export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const gradienteId = useId();

  const markSize = { sm: "size-6", md: "size-7", lg: "size-9" }[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className={cn(markSize, "shrink-0")} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradienteId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <path d="M5 28V4h5l12 15.5V4h5v24h-5L10 12.5V28H5Z" fill={`url(#${gradienteId})`} />
      </svg>

      {showWordmark ? (
        <span className={cn("font-semibold tracking-tight text-foreground", textSize)}>nexosgen-financehub</span>
      ) : null}
    </div>
  );
}
