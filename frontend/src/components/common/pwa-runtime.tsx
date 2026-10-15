"use client";

import { useEffect } from "react";

/** Instala o worker na origem atual, sem armazenar páginas ou dados da conta. */
export function PwaRuntime() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((error) => {
      console.warn("[NexosFinn] Não foi possível preparar a instalação do app.", error);
    });
  }, []);

  return null;
}
