import Image from "next/image";

import { cn } from "@/lib/utils";

/*
 * Assets oficiais da marca, gerados a partir de mídia/logo.png.
 *
 * O original tem o "Nexos" em preto, que some sobre o fundo quase preto do
 * tema escuro. A variante `-dark` é o mesmo arquivo com apenas o preto neutro
 * do wordmark clareado (e o preto das dobras do símbolo levemente erguido) —
 * o desenho, o laranja e as proporções são os do asset original.
 */
const LOGO_LIGHT = "/brand/nexosfinn-logo.png";
const LOGO_DARK = "/brand/nexosfinn-logo-dark.png";
const SYMBOL = "/brand/nexosfinn-symbol.png";

// Proporção do logo completo recortado (largura / altura).
const LOGO_RATIO = 542 / 160;

/**
 * Marca NexosFinn: símbolo + wordmark, a partir do asset oficial.
 *
 * Nos dois temas o arquivo certo é escolhido só com CSS (`dark:`), sem
 * JavaScript: a troca acontece junto com a classe `.dark`, inclusive quando
 * um trecho da página força o tema escuro localmente, como a landing.
 */
export function Logo({
  className,
  showWordmark = true,
  size = "md",
  priority = false,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  /** Pré-carrega a imagem; use no logo que aparece na primeira dobra. */
  priority?: boolean;
}) {
  const height = { sm: 24, md: 30, lg: 38 }[size];

  if (!showWordmark) {
    return (
      <span className={cn("inline-flex shrink-0", className)}>
        <Image src={SYMBOL} alt="NexosFinn" width={height} height={height} priority={priority} />
      </span>
    );
  }

  const width = Math.round(height * LOGO_RATIO);

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={LOGO_DARK}
        alt="NexosFinn"
        width={width}
        height={height}
        priority={priority}
        className="hidden dark:block"
        style={{ width, height }}
      />
      <Image
        src={LOGO_LIGHT}
        alt="NexosFinn"
        width={width}
        height={height}
        priority={priority}
        className="block dark:hidden"
        style={{ width, height }}
      />
    </span>
  );
}
