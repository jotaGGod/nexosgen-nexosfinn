"use client";

import {
  Check,
  LayoutDashboard,
  Loader2,
  Moon,
  RotateCcw,
  Sun,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { useState, type MouseEvent } from "react";

import { useTheme } from "@/components/common/theme-provider";
import {
  type DashboardSection,
  useDashboardPreferences,
} from "@/components/dashboard/dashboard-preferences";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { runMutation, useResetFinancialData } from "@/hooks/use-nexosgen-nexosfinn";
import type { Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const themeOptions = [
  {
    value: "light",
    label: "Claro",
    description: "Fundo claro e cartões brancos, como no visual original.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Escuro",
    description: "Tons navy com contraste suave para ambientes com pouca luz.",
    icon: Moon,
  },
] satisfies ReadonlyArray<{
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
}>;

const dashboardOptions: Array<{ value: DashboardSection; label: string; description: string }> = [
  { value: "summary", label: "Resumo financeiro", description: "Saldo, receitas, despesas e economia." },
  { value: "cashflow", label: "Fluxo de caixa", description: "Evolução mensal de entradas e saídas." },
  { value: "categories", label: "Gastos por categoria", description: "Distribuição das despesas do período." },
  { value: "transactions", label: "Transações recentes", description: "Últimos lançamentos do período escolhido." },
  { value: "goals", label: "Metas", description: "Progresso dos seus objetivos financeiros." },
];

/** Aba de preferências visuais salvas neste navegador. */
export function PreferencesTab() {
  const { theme, setTheme } = useTheme();
  const { preferences, setSectionVisible, resetPreferences } = useDashboardPreferences();
  const resetFinancialData = useResetFinancialData();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  async function handleReset(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const result = await runMutation(resetFinancialData, undefined);
    if (result.ok) setResetDialogOpen(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Escolha como a NexosFinn deve aparecer para você.</CardDescription>
        </CardHeader>

        <CardContent>
          <fieldset>
            <legend className="sr-only">Tema da interface</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const selected = theme === option.value;

                return (
                  <label
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4 transition-colors hover:bg-secondary/60",
                      "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                      selected && "border-active bg-active/5 ring-1 ring-active/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={selected}
                      onChange={() => setTheme(option.value)}
                      className="sr-only"
                    />

                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground",
                        selected && "bg-active/15 text-active",
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>

                    <span className="min-w-0 pr-6">
                      <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </span>
                    </span>

                    {selected ? (
                      <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-active text-active-foreground">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-4 text-xs text-muted-foreground">
            A preferência fica salva neste navegador e é aplicada também nas telas de entrada e cadastro.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-active/10 text-active">
              <LayoutDashboard className="size-[18px]" />
            </span>
            <div>
              <CardTitle>Tela inicial</CardTitle>
              <CardDescription className="mt-1">
                Escolha os blocos exibidos no Dashboard em computador, tablet e celular.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="divide-y divide-border/70 rounded-2xl border border-border/80">
            {dashboardOptions.map((option) => {
              const visible = preferences[option.value];
              return (
                <div key={option.value} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{option.label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{option.description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={visible}
                    aria-label={`${visible ? "Ocultar" : "Exibir"} ${option.label}`}
                    onClick={() => setSectionVisible(option.value, !visible)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      visible ? "border-active bg-active" : "border-border bg-secondary",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1 size-[18px] rounded-full bg-white shadow-sm transition-transform",
                        visible ? "translate-x-[25px]" : "translate-x-1",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={resetPreferences}>
            <RotateCcw />
            Restaurar blocos padrão
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TriangleAlert className="size-[18px]" />
            </span>
            <div className="space-y-1">
              <CardTitle>Começar do zero</CardTitle>
              <CardDescription>Apague os dados financeiros e volte ao estado inicial da NexosFinn.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Transações, contas, categorias, metas e orçamentos serão apagados. Seu perfil, acesso e chaves de
            integração serão mantidos.
          </p>

          <AlertDialog
            open={resetDialogOpen}
            onOpenChange={(open) => {
              if (!resetFinancialData.isPending) setResetDialogOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="size-4" />
                Começar do zero
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apagar todos os dados financeiros?</AlertDialogTitle>
                <AlertDialogDescription className="leading-relaxed">
                  Esta ação não pode ser desfeita. A NexosFinn apagará seus lançamentos, contas, categorias, metas e
                  orçamentos, e recriará apenas a conta e as categorias padrão.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={resetFinancialData.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} disabled={resetFinancialData.isPending}>
                  {resetFinancialData.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Apagar e recomeçar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
