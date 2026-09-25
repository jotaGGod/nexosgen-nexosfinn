import { cn } from "@/lib/utils";

/**
 * Peças de composição da página de vendas.
 *
 * Toda seção usa a mesma largura, o mesmo respiro vertical e o mesmo formato
 * de título. É isso que dá à página o ritmo de "blocos" — cada seção é um
 * bloco visual próprio, com o conteúdo centrado numa área bem definida.
 */

/** Contêiner padrão de seção: largura máxima e respiro consistentes. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative mx-auto w-full max-w-[1240px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:py-32",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Selo pequeno acima do título: ponto laranja + rótulo. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.9)]" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * Título de seção.
 *
 * `titulo` aceita nós para que uma ou duas palavras venham em serif itálica
 * (<Destaque>). No layout "split", o texto de apoio vai para a direita no
 * desktop, como nas referências; no celular tudo empilha e centraliza.
 */
export function SectionHeading({
  eyebrow,
  titulo,
  texto,
  layout = "center",
  className,
}: {
  eyebrow: string;
  titulo: React.ReactNode;
  texto?: React.ReactNode;
  layout?: "center" | "split";
  className?: string;
}) {
  if (layout === "split") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:text-left",
          className,
        )}
      >
        <div className="flex max-w-2xl flex-col items-center lg:items-start">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            {titulo}
          </h2>
        </div>
        {texto ? (
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:pb-1.5">{texto}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("mx-auto flex max-w-2xl flex-col items-center text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
        {titulo}
      </h2>
      {texto ? (
        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">{texto}</p>
      ) : null}
    </div>
  );
}

/** Palavra de destaque em serif itálica dentro de um título. */
export function Destaque({ children }: { children: React.ReactNode }) {
  return <span className="font-display text-foreground/95">{children}</span>;
}

/**
 * Halo de luz laranja.
 *
 * Um único gradiente radial, sem `filter: blur` — o desfoque já vem do próprio
 * degradê, o que mantém o custo de pintura baixo mesmo com vários na página.
 */
export function Halo({ className, intensity = 0.2 }: { className?: string; intensity?: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{
        background: `radial-gradient(circle, rgba(255, 95, 20, ${intensity}), transparent 62%)`,
      }}
    />
  );
}
