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
    <header className={cn("flex flex-col gap-3", className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
