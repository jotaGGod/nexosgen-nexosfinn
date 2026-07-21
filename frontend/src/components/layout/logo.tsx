import { cn } from "@/lib/utils";

/**
 * Marca do produto: losango em degradê violeta → rosa com o monograma.
 *
 * Desenhada em SVG inline para não depender de arquivo externo e acompanhar
 * a cor do tema.
 */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
          <path
            d="M6 17.5V9.5C6 7.567 7.567 6 9.5 6h8"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M6 12.5h7.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
      {showWordmark ? <span className="text-base font-semibold tracking-tight text-white">FinApp</span> : null}
    </div>
  );
}
