import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Comece sem cartão</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">Criar sua conta</h1>
        <p className="text-sm text-muted-foreground">
          Sua conta já começa com categorias e uma conta corrente prontas para o primeiro lançamento.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
