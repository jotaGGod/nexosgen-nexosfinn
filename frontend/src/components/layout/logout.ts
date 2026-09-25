import type { useRouter } from "next/navigation";

/** Encerra a sessão e volta ao login; uma falha de rede não prende o usuário. */
export async function sairDaConta(router: ReturnType<typeof useRouter>) {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Servidor fora do ar não pode impedir o usuário de sair.
  }
  router.replace("/login");
  router.refresh();
}
