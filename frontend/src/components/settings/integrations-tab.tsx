"use client";

import {
  AlertTriangle,
  BookOpen,
  Check,
  Copy,
  Goal,
  KeyRound,
  Landmark,
  Loader2,
  Plus,
  ReceiptText,
  Tags,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, ErrorState, RowsSkeleton } from "@/components/ui/states";
import { runMutation, useAPIKeys, useCreateAPIKey, useRevokeAPIKey } from "@/hooks/use-nexosgen-nexosfinn";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { APIKey, APIKeyStatus } from "@/types/api";

/**
 * Escopos oferecidos na criação da chave, agrupados pelo recurso exposto na
 * API externa. A ordem acompanha o contrato do backend para que a interface
 * não anuncie permissões que a chave não consegue receber.
 */
interface ScopeOption {
  value: string;
  label: string;
  description: string;
}

interface ScopeGroup {
  label: string;
  description: string;
  options: ScopeOption[];
}

const scopeGroups: ScopeGroup[] = [
  {
    label: "Transações",
    description: "Lançamentos, consulta e liquidação",
    options: [
      { value: "read:transactions", label: "Ler", description: "Listar, consultar e filtrar lançamentos" },
      { value: "write:transactions", label: "Criar e editar", description: "Criar, atualizar e liquidar" },
      { value: "delete:transactions", label: "Excluir", description: "Remover lançamentos" },
    ],
  },
  {
    label: "Saldo e contas",
    description: "Saldo consolidado e contas financeiras",
    options: [
      { value: "read:balance", label: "Ler saldo", description: "Consultar saldo e resumo por período" },
      { value: "read:accounts", label: "Ler contas", description: "Listar e consultar contas" },
      { value: "write:accounts", label: "Criar e editar contas", description: "Cadastrar ou atualizar contas" },
      { value: "delete:accounts", label: "Excluir contas", description: "Remover contas permitidas" },
    ],
  },
  {
    label: "Categorias",
    description: "Classificação de receitas e despesas",
    options: [
      { value: "read:categories", label: "Ler", description: "Listar e consultar categorias" },
      { value: "write:categories", label: "Criar e editar", description: "Cadastrar ou atualizar categorias" },
      { value: "delete:categories", label: "Excluir", description: "Remover categorias permitidas" },
    ],
  },
  {
    label: "Metas",
    description: "Objetivos de poupança e aportes",
    options: [
      { value: "read:goals", label: "Ler", description: "Listar e consultar metas" },
      { value: "write:goals", label: "Criar, editar e aportar", description: "Gerenciar metas e registrar aportes" },
      { value: "delete:goals", label: "Excluir", description: "Remover metas" },
    ],
  },
  {
    label: "Orçamentos",
    description: "Limites mensais por categoria",
    options: [
      { value: "read:budgets", label: "Ler", description: "Listar e consultar orçamentos" },
      { value: "write:budgets", label: "Criar e editar", description: "Definir ou atualizar limites" },
      { value: "delete:budgets", label: "Excluir", description: "Remover orçamentos" },
    ],
  },
];

const scopeOptions = scopeGroups.flatMap((group) => group.options);

const endpointGroups = [
  {
    icon: ReceiptText,
    title: "Transações",
    scope: "read/write/delete:transactions",
    methods: "GET, POST, PUT, PATCH e DELETE",
    routes: ["/transactions", "/transactions/{id}"],
  },
  {
    icon: Tags,
    title: "Categorias",
    scope: "read/write/delete:categories",
    methods: "GET, POST, PUT e DELETE",
    routes: ["/categories", "/categories/{id}"],
  },
  {
    icon: Landmark,
    title: "Saldo e contas",
    scope: "read:balance e read/write/delete:accounts",
    methods: "GET, POST, PUT e DELETE",
    routes: ["/balance", "/accounts", "/accounts/{id}"],
  },
  {
    icon: Goal,
    title: "Metas e aportes",
    scope: "read/write/delete:goals",
    methods: "GET, POST, PUT e DELETE",
    routes: ["/goals", "/goals/{id}", "/goals/{id}/contributions"],
  },
  {
    icon: WalletCards,
    title: "Orçamentos",
    scope: "read/write/delete:budgets",
    methods: "GET, PUT e DELETE",
    routes: ["/budgets", "/budgets/{id}"],
  },
] as const;

const statusBadge: Record<APIKeyStatus, { variant: "income" | "expense" | "outline"; label: string }> = {
  active: { variant: "income", label: "Ativa" },
  revoked: { variant: "expense", label: "Revogada" },
  expired: { variant: "outline", label: "Expirada" },
};

/**
 * Aba de integrações.
 *
 * É aqui que o usuário gera a chave que será colada no n8n. O segredo aparece
 * uma única vez, no diálogo pós-criação — depois disso nem a interface nem o
 * backend conseguem recuperá-lo.
 */
export function IntegrationsTab() {
  const { data: keys = [], isPending, isError, refetch } = useAPIKeys();
  const createKey = useCreateAPIKey();
  const revokeKey = useRevokeAPIKey();

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(scopeOptions.map((option) => option.value));
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<APIKey | null>(null);

  function toggleScope(scope: string) {
    setScopes((current) =>
      current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope],
    );
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Dê um nome para a chave.");
      return;
    }

    const result = await runMutation(createKey, { name: name.trim(), scopes });
    if (!result.ok) return;

    setFormOpen(false);
    setName("");
    setScopes(scopeOptions.map((option) => option.value));
    setCreatedKey(result.data.plain_key);
  }

  async function handleCopy() {
    if (!createdKey) return;

    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto e copie manualmente.");
    }
  }

  async function confirmRevoke() {
    if (!pendingRevoke) return;
    const result = await runMutation(revokeKey, pendingRevoke.id);
    if (result.ok) setPendingRevoke(null);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Chaves de API</CardTitle>
            <CardDescription className="mt-1 max-w-2xl">
              Use esta chave para conectar sua NexosFinn a automações externas, como assistentes de WhatsApp via
              n8n. Cada chave carrega apenas os escopos que você marcar.
            </CardDescription>
          </div>

          <Button variant="gradient" className="shrink-0" onClick={() => setFormOpen(true)}>
            <Plus />
            Gerar nova API Key
          </Button>
        </CardHeader>

        {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
        {isPending && !isError ? <RowsSkeleton rows={3} /> : null}

        {!isPending && keys.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="Nenhuma chave gerada"
            description="Gere uma chave para permitir que uma automação lance e consulte transações na sua conta."
            action={
              <Button variant="gradient" onClick={() => setFormOpen(true)}>
                <Plus />
                Gerar nova API Key
              </Button>
            }
          />
        ) : null}

        {keys.length > 0 ? (
          <ul className="divide-y divide-border/70">
            {keys.map((key) => {
              const badge = statusBadge[key.status];
              const revoked = key.status !== "active";

              return (
                <li key={key.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      revoked
                        ? "bg-secondary text-muted-foreground"
                        : "bg-active/12 text-active",
                    )}
                  >
                    <KeyRound className="size-[18px]" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn("truncate font-medium", revoked && "text-muted-foreground")}>
                        {key.name}
                      </p>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>

                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{key.prefix}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Criada em {formatDate(key.created_at)}
                      {key.last_used_at ? ` · último uso em ${formatDate(key.last_used_at)}` : " · nunca usada"}
                      {key.expires_at ? ` · expira em ${formatDate(key.expires_at)}` : ""}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>

                  {key.status === "active" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setPendingRevoke(key)}
                    >
                      <Trash2 />
                      Revogar
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API externa e como conectar ao n8n</CardTitle>
          <CardDescription>
            A automação de WhatsApp não faz parte deste projeto — a API já está pronta para receber transações,
            categorias, contas, metas, aportes e orçamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-muted-foreground">
          <p>
            No n8n, crie uma credencial <span className="font-medium text-foreground">Header Auth</span> com o
            nome <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">X-API-Key</code> e cole a
            chave gerada aqui. Depois use a base{" "}
            <code className="break-all rounded bg-secondary px-1 py-0.5 font-mono text-xs">
              https://nexosfinn.vercel.app/api/v1/external
            </code>{" "}
            nos nós HTTP.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {endpointGroups.map(({ icon: Icon, title, scope, methods, routes }) => (
              <article key={title} className="rounded-2xl border border-border bg-secondary/35 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-active/10 text-active">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground">{title}</h3>
                    <p className="mt-0.5 text-xs">{methods}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 font-mono text-[11px] text-foreground/85">
                  {routes.map((route) => (
                    <p key={route} className="break-all">
                      {route}
                    </p>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">{scope}</p>
              </article>
            ))}
          </div>

          <a
            href="/docs"
            className="inline-flex items-center gap-2 font-medium text-active underline-offset-4 hover:underline"
          >
            <BookOpen className="size-4" />
            Abrir documentação completa da API
          </a>
        </CardContent>
      </Card>

      {/* Criação */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerar nova API Key</DialogTitle>
            <DialogDescription>Conceda apenas os escopos que a automação realmente precisa.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Nome da chave</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Assistente WhatsApp (n8n)"
                autoComplete="off"
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label>Escopos</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-xs"
                  onClick={() => setScopes(scopeOptions.map((option) => option.value))}
                >
                  Selecionar todos
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {scopeGroups.map((group) => (
                  <section key={group.label} className="rounded-2xl border border-border p-3">
                    <div className="mb-2">
                      <p className="text-sm font-medium">{group.label}</p>
                      <p className="text-xs text-muted-foreground">{group.description}</p>
                    </div>
                    <div className="space-y-1">
                      {group.options.map((option) => (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-start gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-secondary/60"
                        >
                          <input
                            type="checkbox"
                            checked={scopes.includes(option.value)}
                            onChange={() => toggleScope(option.value)}
                            className="mt-0.5 size-4 accent-[hsl(var(--active))]"
                          />
                          <span className="min-w-0">
                            <span className="block text-xs font-medium">{option.label}</span>
                            <span className="block text-[11px] leading-snug text-muted-foreground">
                              {option.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button variant="gradient" onClick={handleCreate} disabled={createKey.isPending}>
                {createKey.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Gerar chave
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exibição única do segredo */}
      <Dialog open={Boolean(createdKey)} onOpenChange={(open) => !open && setCreatedKey(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chave criada</DialogTitle>
            <DialogDescription>
              Copie agora — por segurança, ela não será exibida novamente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Guarde a chave em local seguro. Se perdê-la, será necessário revogar esta e gerar uma nova.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 p-3">
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{createdKey}</code>
            <Button variant="outline" size="sm" className="shrink-0" onClick={handleCopy}>
              {copied ? <Check className="text-positive" /> : <Copy />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button variant="gradient" onClick={() => setCreatedKey(null)}>
              Já copiei a chave
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingRevoke)} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar chave</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRevoke
                ? `"${pendingRevoke.name}" deixa de funcionar imediatamente. Toda automação que a estiver usando vai parar de responder.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevoke} disabled={revokeKey.isPending}>
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
