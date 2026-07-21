"use client";

import { ChevronRight, LogOut, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-finapp";
import { initials } from "@/lib/format";

/** Bloco do usuário no rodapé da sidebar, com acesso a perfil e logout. */
export function UserMenu() {
  const router = useRouter();
  const { data: user, isPending } = useProfile();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Backend fora do ar não pode impedir o usuário de sair nem derrubar a
      // aplicação: o cookie é limpo do lado do servidor e, na pior hipótese,
      // a sessão expira sozinha.
    }

    // replace evita que o botão "voltar" retorne a uma tela protegida.
    router.replace("/login");
    router.refresh();
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-3 px-2 py-2">
        <Skeleton className="size-9 rounded-full bg-slate-700" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24 bg-slate-700" />
          <Skeleton className="h-2.5 w-32 bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
          {user ? initials(user.name) : "?"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{user?.name}</span>
          <span className="block truncate text-xs text-slate-400">{user?.email}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-slate-500" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            <UserIcon />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes?tab=integracoes">
            <Settings />
            Integrações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive disabled={signingOut} onSelect={handleSignOut}>
          <LogOut />
          {signingOut ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
