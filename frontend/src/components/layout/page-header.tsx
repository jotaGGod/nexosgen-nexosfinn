import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Controles da tela: seletor de período, botão de ação, etc. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Título de cada tela.
 *
 * Empilha por padrão: numa coluna estreita, título e controles lado a lado
 * espremeriam os dois. Deixou de ser componente de cliente ao perder o botão
 * de abrir a barra lateral — agora a navegação é a barra inferior.
 */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:min-h-[76px] lg:items-start",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-active">
          Sua central financeira
        </p>
        <h1 className="text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      {actions ? (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end lg:pr-28">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
