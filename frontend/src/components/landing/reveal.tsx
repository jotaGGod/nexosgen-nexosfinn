"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Atraso em milissegundos, para escalonar itens de uma mesma lista. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Entrada suave ao rolar: aparece subindo.
 *
 * Feito com IntersectionObserver e transição CSS em vez de uma biblioteca de
 * animação. Numa página de vendas estática, o custo de ~50 kB de JavaScript
 * para produzir um fade de 400ms sairia direto do orçamento de performance —
 * que é justamente o que a página precisa entregar.
 *
 * O elemento já ocupa seu espaço final antes de animar (só opacidade e
 * deslocamento mudam), então não há deslocamento de layout.
 */
export function Reveal({ children, delay = 0, className, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    // Sem suporte a observer, o conteúdo aparece direto — nunca escondido.
    if (typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisivel(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-[opacity,transform] duration-[400ms] ease-out-expo motion-reduce:transition-none",
        visivel ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
