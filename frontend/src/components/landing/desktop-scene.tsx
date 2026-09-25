"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Destaque, Eyebrow } from "@/components/landing/primitives";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LARGURA = 1280;

/**
 * "Tudo em um só lugar": o painel desktop real, de pé como uma tela que se
 * inclina até ficar de frente conforme a seção entra — a mesma ideia de
 * câmera das cenas do iPhone, agora no computador.
 *
 * O painel é desenhado em 1280px e escalado para caber. No celular ele fica
 * maior que a tela (ilegível se reduzido inteiro) e a rolagem o percorre na
 * horizontal, como uma janela passando pelo painel.
 */
export function DesktopScene() {
  const secao = useRef<HTMLElement>(null);

  useEffect(() => {
    const raiz = secao.current;
    if (!raiz) return;
    const janela = raiz.querySelector<HTMLElement>("[data-window]");
    const painel = raiz.querySelector<HTMLElement>("[data-panel]");
    if (!janela || !painel) return;

    const ajustar = () => {
      const largura = janela.clientWidth;
      const escala = largura >= 768 ? Math.min(1, largura / LARGURA) : 0.5;
      janela.style.setProperty("--dk", escala.toFixed(4));
      janela.style.height = `${painel.offsetHeight * escala}px`;
    };
    ajustar();
    const observer = new ResizeObserver(ajustar);
    observer.observe(janela);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(raiz);
      gsap.set(q("[data-tilt]"), { rotationX: 34, y: 80, scale: 0.9, transformOrigin: "50% 100%" });
      gsap.set(q("[data-panel] [data-bar]"), { scaleY: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: janela, start: "top 90%", end: "top 20%", scrub: 0.8, invalidateOnRefresh: true },
      });
      tl.to(q("[data-tilt]"), { rotationX: 0, y: 0, scale: 1, duration: 1 }, 0).to(
        q("[data-panel] [data-bar]"),
        { scaleY: 1, stagger: 0.03, duration: 0.5 },
        0.5,
      );

      // No celular, a janela percorre o painel na horizontal.
      const pan = gsap.to(q("[data-pan]"), {
        x: () => Math.min(0, janela.clientWidth - LARGURA * Number(getComputedStyle(janela).getPropertyValue("--dk") || 1)),
        ease: "none",
        scrollTrigger: { trigger: janela, start: "top 60%", end: "bottom 30%", scrub: 0.8, invalidateOnRefresh: true },
      });

      return () => {
        pan.kill();
      };
    });

    return () => {
      observer.disconnect();
      mm.revert();
    };
  }, []);

  return (
    <section ref={secao} id="analises" className="relative scroll-mt-24 overflow-x-clip py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[60%] bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,95,20,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center">
        <Eyebrow>No computador</Eyebrow>
        <h2 className="mt-5 text-balance text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[clamp(3.25rem,5.5vw,5.5rem)]">
          Tudo em <Destaque>um só lugar.</Destaque>
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          O painel completo: resumo do mês, fluxo de caixa, gastos por categoria, transações recentes e metas, lado a
          lado — a mesma conta do celular.
        </p>
      </div>

      <div className="relative mx-auto mt-14 w-full max-w-[1320px] px-5 sm:px-8 [perspective:1600px]">
        <div data-tilt>
          <div data-window className="relative overflow-hidden rounded-[32px] [--dk:0.5]">
            <div data-pan>
              <div
                data-panel
                aria-hidden="true"
                className="origin-top-left"
                style={{ width: LARGURA, transform: "scale(var(--dk))" }}
              >
                <DashboardPreview />
              </div>
            </div>
            {/* Fusão com o fundo no pé da janela. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
        <p className="sr-only">
          Painel da NexosFinn no computador com receitas, despesas, economia, saldo total, fluxo de caixa, gastos por
          categoria, transações recentes e metas.
        </p>
      </div>
    </section>
  );
}
