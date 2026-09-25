"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { IPhone17ProMax } from "@/components/device/iphone";
import { ScreenDashboard } from "@/components/landing/app-screens";
import { Destaque, Eyebrow } from "@/components/landing/primitives";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Encerramento: menos movimento, uma chamada forte e o iPhone ao fundo, que
 * chega inclinado e assenta de frente — a ideia de conclusão depois de toda
 * a narrativa. É a única animação da seção, e ela para quando o aparelho
 * estabiliza.
 */
export function ClosingScene() {
  const secao = useRef<HTMLElement>(null);

  useEffect(() => {
    const raiz = secao.current;
    if (!raiz) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(raiz);
      gsap.fromTo(
        q("[data-device]"),
        { rotationX: 38, rotationY: -24, rotation: 6, y: 160 },
        {
          rotationX: 14,
          rotationY: 0,
          rotation: 0,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: raiz, start: "top 85%", end: "center 55%", scrub: 0.8 },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={secao} className="relative overflow-hidden px-5 pt-24 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_100%,rgba(255,95,20,0.26),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[20%] top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <Eyebrow>Comece hoje</Eyebrow>
        <h2 className="mt-6 text-balance text-[2.4rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-[clamp(3.5rem,6vw,6rem)]">
          Assuma o controle <Destaque>das suas finanças.</Destaque>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
          Crie sua conta, conecte seus bancos e veja para onde seu dinheiro está indo. Leva dois minutos.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/cadastro"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-[0_14px_40px_-12px_rgba(255,106,26,0.7)] transition-[transform,box-shadow] duration-300 ease-out-expo hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(255,106,26,0.85)] active:scale-100"
          >
            Criar conta grátis
            <ArrowUpRight className="size-4 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-7 text-sm font-semibold text-foreground transition-[transform,background-color,border-color] duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.09]"
          >
            Já tenho conta
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Grátis para começar · sem cartão de crédito</p>
      </div>

      {/* O aparelho ao fundo, cortado pela base da seção. */}
      <div aria-hidden="true" className="relative mx-auto mt-16 h-[300px] w-[251px] sm:h-[360px] sm:w-[312px]">
        {/* A perspectiva fica no pai direto do aparelho, senão a rotação achata. */}
        <div
          className="origin-top-left scale-[0.643] [perspective:1400px] sm:scale-[0.8]"
          style={{ width: 390, height: 817 }}
        >
          <IPhone17ProMax screen={<ScreenDashboard />} />
        </div>
      </div>
    </section>
  );
}
