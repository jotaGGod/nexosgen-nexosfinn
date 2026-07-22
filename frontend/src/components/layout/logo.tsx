import { cn } from "@/lib/utils";

/**
 * Marca Vanta: um "V" anguloso em degradê do limão de assinatura para o roxo
 * de apoio.
 *
 * Desenhada em SVG inline — não depende de arquivo externo, não gera
 * requisição e escala sem perda em qualquer tamanho. O identificador do
 * gradiente é único por instância para que duas marcas na mesma página não
 * disputem a mesma definição.
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
  const markSize = { sm: "size-6", md: "size-7", lg: "size-9" }[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className={cn(markSize, "shrink-0")} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="vanta-mark" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <path d="M4 3h6.4L16 20.2 21.6 3H28L18.4 29h-4.8L4 3Z" fill="url(#vanta-mark)" />
      </svg>

      {showWordmark ? (
        <span className={cn("font-semibold tracking-tight text-foreground", textSize)}>Vanta</span>
      ) : null}
    </div>
  );
}
