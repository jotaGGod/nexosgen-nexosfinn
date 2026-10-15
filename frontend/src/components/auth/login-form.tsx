"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { loginSchema, type LoginValues } from "@/schemas/auth";
import type { ApiErrorBody } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showResetLink, setShowResetLink] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    setShowResetLink(false);

    let response: Response;
    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      // Sem este catch, uma falha de rede vira rejeição não tratada e derruba
      // a árvore React na error boundary em vez de mostrar a mensagem.
      setFormError("Não foi possível conectar ao servidor. Verifique sua conexão.");
      return;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
      setFormError(body?.error?.message ?? "Não foi possível entrar. Tente novamente.");
      setShowResetLink(true);
      return;
    }

    // refresh descarta o cache do roteador para que o layout autenticado
    // enxergue o cookie recém-criado, evitando um retorno ao login.
    const destination = searchParams.get("redirect");
    router.replace(destination?.startsWith("/app/") ? destination : "/app/dashboard");
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

      {showResetLink ? (
        <p className="-mt-2 text-center text-sm text-muted-foreground">
          Esqueceu a senha?{" "}
          <Link href="/recuperar-senha" className="font-semibold text-primary hover:underline">
            Redefinir senha
          </Link>
        </p>
      ) : null}

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
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-10"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground hover:bg-secondary"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <FieldError>{errors.password?.message}</FieldError>
      </div>

      <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Entrar
      </Button>
    </form>
  );
}
