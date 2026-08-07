"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { registerSchema, type RegisterValues } from "@/schemas/auth";
import type { ApiErrorBody } from "@/types/api";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterValues) {
    setFormError(null);

    let response: Response;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      // Idem ao login: falha de rede precisa virar mensagem, não exceção.
      setFormError("Não foi possível conectar ao servidor. Verifique sua conexão.");
      return;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

      // O backend acusa erros por campo; realocá-los no formulário evita que o
      // usuário tenha que adivinhar qual input corrigir.
      const fields = body?.error?.fields;
      if (fields) {
        for (const [field, message] of Object.entries(fields)) {
          if (field === "name" || field === "email" || field === "password") {
            setError(field, { message });
          }
        }
      }

      if (!fields) {
        setFormError(body?.error?.message ?? "Não foi possível criar a conta.");
      }
      return;
    }

    router.replace("/app/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/30 bg-red-50 px-4 py-3 text-sm text-destructive dark:bg-destructive/10"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Seu nome"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@email.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Criar conta
      </Button>
    </form>
  );
}
