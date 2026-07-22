"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Percentual de 0 a 100; valores acima são recortados na barra. */
  value: number;
  /** Cor da barra; aceita qualquer valor CSS. */
  color?: string;
  size?: "sm" | "md";
}

/**
 * Barra de progresso usada em metas e orçamentos.
 *
 * Implementada sem Radix porque o componente é puramente visual e precisa
 * aceitar cor arbitrária vinda do cadastro do usuário.
 */
function Progress({ value, color, size = "md", className, ...props }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-full bg-secondary",
        size === "sm" ? "h-1.5" : "h-2",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${clamped}%`,
          background: color ?? "hsl(var(--primary))",
        }}
      />
    </div>
  );
}

export { Progress };
