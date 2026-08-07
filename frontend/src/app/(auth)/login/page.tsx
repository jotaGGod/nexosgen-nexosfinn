import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Acesse sua central</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground">Entre para continuar acompanhando suas finanças.</p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
