import { TrendingDown, TrendingUp } from "lucide-react";

import { formatVariation } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VariationProps {
  value: number;
  /**
   * Em despesas, cair é bom. Este sinalizador inverte as cores para que verde
   * signifique sempre "resultado favorável".
   */
  invert?: boolean;
  label?: string;
  className?: string;
}

/** Selo de variação percentual contra o período anterior. */
export function Variation({ value, invert = false, label = "vs período anterior", className }: VariationProps) {
  const favorable = invert ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;

  return (
    <p className={cn("flex flex-wrap items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 font-semibold",
          favorable ? "text-emerald-400" : "text-red-400",
        )}
      >
        <Icon className="size-3.5" />
        {formatVariation(value)}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </p>
  );
}
