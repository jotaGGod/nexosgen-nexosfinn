import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  /** Controles da tela: seletor de período, botão de ação, etc. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Título de cada tela.
 *
 * Título grande e leve, como nas referências, com os controles da tela à
 * direita no desktop. No celular tudo empilha: título e controles lado a lado
 * espremeriam os dois numa coluna estreita.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8", className)}
    >
      <div className="min-w-0">
        <h1 className="text-[2rem] font-medium leading-[1.1] tracking-[-0.035em] text-foreground sm:text-4xl lg:text-[3.25rem]">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground lg:text-base">{subtitle}</p> : null}
      </div>

      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:justify-end">{actions}</div>
      ) : null}
    </header>
  );
}
