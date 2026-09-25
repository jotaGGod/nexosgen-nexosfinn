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
 * Entrada suave ao rolar: aparece subindo 28px, em 700ms.
 *
 * Feito com IntersectionObserver e transição CSS em vez de uma biblioteca de
 * animação. Numa página de vendas estática, o custo de ~50 kB de JavaScript
 * para produzir um fade sairia direto do orçamento de performance — que é
 * justamente o que a página precisa entregar.
 *
 * Só `opacity` e `transform` mudam, então não há reflow nem deslocamento de
 * layout: o elemento já ocupa seu espaço final antes de animar. Quem pediu
 * menos movimento no sistema vê o conteúdo direto, sem transição.
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out-expo motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        visivel ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
