"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Percentual de 0 a 100; valores acima são recortados na barra. */
  value: number;
  /** Cor da barra; aceita qualquer valor CSS. Sem cor, usa o degradê da marca. */
  color?: string;
  size?: "sm" | "md" | "lg";
  /** Listras diagonais sobre o preenchimento, como nas barras de destaque. */
  striped?: boolean;
}

/**
 * Barra de progresso usada em metas, orçamentos e no início.
 *
 * Implementada sem Radix porque o componente é puramente visual e precisa
 * aceitar cor arbitrária vinda do cadastro do usuário. O preenchimento cresce
 * da esquerda ao montar (só `transform`, sem reflow) e anima a largura quando
 * o valor muda.
 */
function Progress({ value, color, size = "md", striped = false, className, ...props }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-secondary",
        size === "sm" && "h-1.5",
        size === "md" && "h-2.5",
        size === "lg" && "h-4",
        className,
      )}
      {...props}
    >
      <div
        className="grow-x h-full rounded-full transition-[width] duration-700 ease-out-expo"
        style={{
          width: `${clamped}%`,
          background: color ?? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
        }}
      >
        {striped ? <div className="stripes size-full rounded-full" /> : null}
      </div>
    </div>
  );
}

export { Progress };
