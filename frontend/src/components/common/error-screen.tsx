"use client";

import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Tela de falha do aplicativo.
 *
 * Substitui o "Application error: a client-side exception has occurred" do
 * Next, que não diz nada ao usuário nem a quem for investigar. Aqui a mensagem
 * real aparece, junto do `digest` que permite localizar o erro no log do
 * servidor.
 *
 * Também trata o caso mais comum em produção: depois de um novo deploy, uma
 * aba aberta continua pedindo arquivos JavaScript da versão anterior, que não
 * existem mais. O sintoma é idêntico ao de um bug de código, mas a correção é
 * apenas recarregar — então isso é feito automaticamente, uma única vez.
 */

/** Identifica falhas de carregamento de bundle após um deploy. */
function isStaleBundleError(error: Error): boolean {
  const message = `${error.name} ${error.message}`.toLowerCase();

  return (
    message.includes("chunkloaderror") ||
    message.includes("loading chunk") ||
    message.includes("loading css chunk") ||
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed")
  );
}

const RELOAD_FLAG = "finapp:recarregado-por-versao-antiga";

interface ErrorScreenProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorScreen({ error, reset }: ErrorScreenProps) {
  const [recarregando, setRecarregando] = useState(false);

  useEffect(() => {
    // Loga sempre: em produção o console do navegador é a única pista que
    // sobra para o usuário reportar o problema.
    console.error("[FinApp] falha na interface:", error);

    if (!isStaleBundleError(error)) return;

    // A flag impede laço infinito caso o recarregamento não resolva.
    if (sessionStorage.getItem(RELOAD_FLAG)) return;

    sessionStorage.setItem(RELOAD_FLAG, "1");
    setRecarregando(true);
    window.location.reload();
  }, [error]);

  useEffect(() => {
    // Carregou sem erro: libera a tentativa automática para um próximo deploy.
    if (!recarregando) sessionStorage.removeItem(RELOAD_FLAG);
  }, [recarregando]);

  if (recarregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" />
          Atualizando para a versão mais recente...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="size-5 text-destructive" />
        </div>

        <h1 className="mt-4 text-xl font-semibold tracking-tight">Algo deu errado</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A operação pode ter sido concluída mesmo assim — confira antes de repetir.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-secondary/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">Detalhe técnico</p>
          <p className="mt-1 break-words font-mono text-xs text-foreground">
            {error.message || error.name || "erro desconhecido"}
          </p>
          {error.digest ? (
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">digest: {error.digest}</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <RotateCcw className="size-4" />
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <RefreshCw className="size-4" />
            Recarregar a página
          </button>
        </div>
      </div>
    </div>
  );
}
