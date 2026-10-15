"use client";

import { useEffect } from "react";

/** Mantém formulários dentro da área visível quando o teclado do iOS abre. */
export function MobileViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 1023px)");
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!mobile.matches || !viewport || viewport.scale !== 1) {
          root.style.removeProperty("--app-viewport-height");
          root.style.removeProperty("--app-viewport-top");
          return;
        }
        root.style.setProperty("--app-viewport-height", `${viewport.height}px`);
        root.style.setProperty("--app-viewport-top", `${viewport.offsetTop}px`);
      });
    }

    update();
    viewport.addEventListener("resize", update, { passive: true });
    viewport.addEventListener("scroll", update, { passive: true });
    mobile.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      mobile.removeEventListener("change", update);
      root.style.removeProperty("--app-viewport-height");
      root.style.removeProperty("--app-viewport-top");
    };
  }, []);

  return null;
}
