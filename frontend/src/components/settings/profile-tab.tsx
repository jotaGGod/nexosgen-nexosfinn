"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { RowsSkeleton } from "@/components/ui/states";
import { runMutation, useChangePassword, useProfile, useUpdateProfile } from "@/hooks/use-nexosgen-nexosfinn";
import { initials } from "@/lib/format";

const profileSchema = z.object({
  name: z.string().min(1, "Informe seu nome"),
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Informe a senha atual"),
    new_password: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres"),
    confirm_password: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ["confirm_password"],
    message: "As senhas não conferem",
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

/** Aba de perfil: dados cadastrais e troca de senha. */
export function ProfileTab() {
  const { data: user, isPending } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  useEffect(() => {
    if (user) profileForm.reset({ name: user.name, email: user.email });
  }, [user, profileForm]);

  if (isPending) {
    return (
      <Card>
        <RowsSkeleton rows={4} />
      </Card>
    );
  }

  async function onSubmitProfile(values: ProfileValues) {
    await runMutation(updateProfile, values);
  }

  async function onSubmitPassword(values: PasswordValues) {
    const result = await runMutation(changePassword, {
      current_password: values.current_password,
      new_password: values.new_password,
    });

    // Só limpa os campos quando a troca deu certo — senha atual incorreta não
    // deve apagar o que o usuário digitou.
    if (result.ok) passwordForm.reset();
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
          <CardDescription>Como você aparece na NexosFinn.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-semibold text-primary-foreground">
              {user ? initials(user.name) : "?"}
            </span>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome</Label>
              <Input id="profile-name" autoComplete="name" {...profileForm.register("name")} />
              <FieldError>{profileForm.formState.errors.name?.message}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" type="email" autoComplete="email" {...profileForm.register("email")} />
              <FieldError>{profileForm.formState.errors.email?.message}</FieldError>
            </div>

            <Button type="submit" variant="gradient" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>
            Trocar a senha encerra as demais sessões abertas na sua conta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("current_password")}
              />
              <FieldError>{passwordForm.formState.errors.current_password?.message}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("new_password")}
              />
              <FieldError>{passwordForm.formState.errors.new_password?.message}</FieldError>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirm_password")}
              />
              <FieldError>{passwordForm.formState.errors.confirm_password?.message}</FieldError>
            </div>

            <Button type="submit" variant="outline" disabled={changePassword.isPending}>
              {changePassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Alterar senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
