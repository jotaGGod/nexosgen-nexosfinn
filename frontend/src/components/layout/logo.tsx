/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

/*
 * Assets oficiais da marca, gerados a partir de mídia/logo.png.
 *
 * O original tem o "Nexos" em preto, que some sobre o fundo quase preto do
 * tema escuro. A variante `-dark` é o mesmo arquivo com apenas o preto neutro
 * do wordmark clareado — desenho, laranja e proporções são os do original.
 *
 * WebP com 96px de altura: cobre a maior altura exibida (38px) em telas 2,5x
 * e pesa ~12 kB, contra ~65 kB do PNG.
 *
 * Servidos como arquivo estático, com `<img>`, e não com `next/image`: na
 * Vercel (modo de "services" do vercel.json) o otimizador `/_next/image`
 * responde 404, e o navegador mostrava o ícone de imagem quebrada ("?") no
 * lugar do logo. Para um arquivo deste tamanho o otimizador não agrega nada.
 */
const LOGO_LIGHT = "/brand/nexosfinn-logo.webp";
const LOGO_DARK = "/brand/nexosfinn-logo-dark.webp";
const SYMBOL = "/brand/nexosfinn-symbol.webp";

// Proporção do logo completo (largura / altura).
const LOGO_RATIO = 325 / 96;

/**
 * Marca NexosFinn: símbolo + wordmark, a partir do asset oficial.
 *
 * Nos dois temas o arquivo certo é escolhido só com CSS (`dark:`). A variante
 * que não aparece fica com `loading="lazy"` e `display: none`, e o navegador
 * não chega a baixá-la.
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
  /** Baixa com prioridade; use no logo que aparece na primeira dobra. */
  priority?: boolean;
}) {
  const height = { sm: 24, md: 30, lg: 38 }[size];
  const carregamento = priority ? "eager" : "lazy";

  if (!showWordmark) {
    return (
      <span className={cn("inline-flex shrink-0", className)}>
        <img
          src={SYMBOL}
          alt="NexosFinn"
          width={height}
          height={height}
          loading={carregamento}
          decoding="async"
          className="object-contain"
          style={{ width: height, height }}
        />
      </span>
    );
  }

  const width = Math.round(height * LOGO_RATIO);

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <img
        src={LOGO_DARK}
        alt="NexosFinn"
        width={width}
        height={height}
        loading={carregamento}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className="hidden dark:block"
        style={{ width, height }}
      />
      <img
        src={LOGO_LIGHT}
        alt="NexosFinn"
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="block dark:hidden"
        style={{ width, height }}
      />
    </span>
  );
}
