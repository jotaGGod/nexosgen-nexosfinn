"use client";

import { useEffect } from "react";

/** Instala o worker na origem atual, sem armazenar páginas ou dados da conta. */
export function PwaRuntime() {
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const fullscreen = window.matchMedia("(display-mode: fullscreen)");
    function keepStatusBarTransparent() {
      const installed = (navigator as Navigator & { standalone?: boolean }).standalone === true
        || standalone.matches || fullscreen.matches;
      if (!installed) return;
      // Next pode reinserir metadados após a hidratação ou uma navegação.
      // Mantém a configuração do app instalado também nesses momentos.
      document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    }
    keepStatusBarTransparent();
    const observer = new MutationObserver(keepStatusBarTransparent);
    observer.observe(document.head, { childList: true });
    standalone.addEventListener("change", keepStatusBarTransparent);
    fullscreen.addEventListener("change", keepStatusBarTransparent);
    return () => {
      observer.disconnect();
      standalone.removeEventListener("change", keepStatusBarTransparent);
      fullscreen.removeEventListener("change", keepStatusBarTransparent);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((error) => {
      console.warn("[NexosFinn] Não foi possível preparar a instalação do app.", error);
    });
  }, []);

  return null;
}
