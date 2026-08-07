import { ArrowLeft, MailWarning } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function RecoverPasswordPage() {
  return (
    <div className="space-y-7">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
        <MailWarning className="size-5" />
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Recuperação segura</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">Redefinir senha</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A recuperação automática por e-mail ainda não está habilitada neste ambiente. Nenhuma solicitação será enviada até que o serviço de e-mail seja configurado.
        </p>
      </div>

      <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" />
        Voltar para entrar
      </Link>
    </div>
  );
}
