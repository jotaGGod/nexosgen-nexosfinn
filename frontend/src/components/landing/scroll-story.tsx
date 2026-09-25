"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ShoppingBasket, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { IPhone17ProMax } from "@/components/device/iphone";
import {
  DADOS,
  ExplodedDashboard,
  ScreenAnalytics,
  ScreenDashboard,
  ScreenGoals,
  ScreenTransactions,
} from "@/components/landing/app-screens";
import { Planet } from "@/components/landing/planet";
import { Eyebrow } from "@/components/landing/primitives";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // A barra de endereço do iOS/Android muda a altura da janela ao rolar;
  // recalcular tudo nesse momento causa um tranco no meio do gesto.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/* --- Cenas de texto --- */

type Lado = "esq" | "dir" | "topo";

const CENAS: { id: string; lado: Lado; eyebrow: string; titulo: React.ReactNode; texto: string }[] = [
  {
    id: "a",
    lado: "esq",
    eyebrow: "Início",
    titulo: (
      <>
        Seu dinheiro inteiro, <span className="font-display">num só olhar.</span>
      </>
    ),
    texto: "Saldo total, receitas, despesas e economia do mês na primeira tela — sempre comparados ao mês anterior.",
  },
  {
    id: "b",
    lado: "dir",
    eyebrow: "Transações",
    titulo: (
      <>
        Cada lançamento <span className="font-display">no lugar certo.</span>
      </>
    ),
    texto: "Categorias com cor e ícone, status de paga ou recebida e filtros por período, categoria e tipo.",
  },
  {
    id: "c",
    lado: "topo",
    eyebrow: "Metas e orçamentos",
    titulo: (
      <>
        Do desejo ao <span className="font-display">valor do mês.</span>
      </>
    ),
    texto: "Diga quanto e até quando: a NexosFinn calcula o aporte mensal e avisa antes do orçamento estourar.",
  },
  {
    id: "d",
    lado: "dir",
    eyebrow: "No celular",
    titulo: (
      <>
        Feito para o bolso, <span className="font-display">como um app.</span>
      </>
    ),
    texto: "Instale na tela de início e use em tela cheia. A mesma conta, sincronizada com o computador.",
  },
  {
    id: "e",
    lado: "esq",
    eyebrow: "Análises",
    titulo: (
      <>
        Entenda para onde <span className="font-display">seu dinheiro vai.</span>
      </>
    ),
    texto: "Visão geral, fluxo de caixa, categorias e tendências do período que você escolher.",
  },
  {
    id: "f",
    lado: "esq",
    eyebrow: "Por dentro",
    titulo: (
      <>
        Cada número, <span className="font-display">uma camada.</span>
      </>
    ),
    texto: "Saldo, resumo, atalhos e gráficos são calculados a partir dos seus próprios lançamentos.",
  },
];

function CenaTexto({ cena }: { cena: (typeof CENAS)[number] }) {
  return (
    <div
      className={cn(
        // Celular: sempre no alto, centralizado, acima do aparelho.
        "pointer-events-none absolute inset-x-5 top-[calc(5.5rem+env(safe-area-inset-top,0px))] z-20 text-center",
        // Desktop: ao lado do aparelho, ou no alto nas cenas centrais.
        "lg:inset-x-auto lg:text-left",
        cena.lado === "esq" && "lg:left-[7vw] lg:top-1/2 lg:w-[min(460px,32vw)] lg:-translate-y-1/2",
        cena.lado === "dir" && "lg:right-[7vw] lg:top-1/2 lg:w-[min(460px,32vw)] lg:-translate-y-1/2",
        cena.lado === "topo" && "lg:left-1/2 lg:top-[11vh] lg:w-[min(680px,60vw)] lg:-translate-x-1/2 lg:text-center",
      )}
    >
      {/*
       * Revelação por máscara só com transform: cada linha sobe por trás de um
       * recorte fixo. Nada de clip-path animado — ele repinta a cada quadro,
       * enquanto transform e opacidade ficam na GPU (120 Hz sem esforço).
       */}
      <div data-scene={cena.id} className="opacity-0">
        <div className="overflow-hidden pb-1">
          <div data-line>
            <Eyebrow>{cena.eyebrow}</Eyebrow>
          </div>
        </div>
        <div className="mt-3 overflow-hidden pb-[0.12em]">
          <h2
            data-line
            className="text-balance text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[2.4rem] lg:text-[clamp(2.6rem,4vw,4.2rem)]"
          >
            {cena.titulo}
          </h2>
        </div>
        <div className="overflow-hidden">
          <p
            data-line
            className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0 lg:mt-4 lg:text-lg"
          >
            {cena.texto}
          </p>
        </div>
      </div>
    </div>
  );
}

/* --- Cartões que saem do aparelho (conteúdo real do app) --- */

function Flutuante({ className, children, longe }: { className?: string; children: React.ReactNode; longe?: boolean }) {
  return (
    <div
      data-float
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 w-[172px] rounded-[24px] border border-white/10 bg-[#111111]/95 p-4 opacity-0 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] lg:w-[228px] lg:p-5",
        longe && "saturate-50",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CartoesFlutuantes() {
  return (
    <>
      <Flutuante>
        <p className="flex items-center justify-between text-[11px] text-white/60 lg:text-xs">
          Saldo total <Wallet className="size-3.5 text-primary" />
        </p>
        <p className="mt-2 text-lg font-semibold tabular-nums lg:text-2xl">R$ 7.580,50</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-positive">
          <TrendingUp className="size-3" /> +12,5%
        </p>
      </Flutuante>
      <Flutuante className="hidden lg:block">
        <p className="text-[11px] text-white/60 lg:text-xs">Orçamento · Alimentação</p>
        <p className="mt-2 text-sm font-semibold tabular-nums lg:text-base">R$ 1.300,00 de R$ 1.620,00</p>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[80%] rounded-full bg-[linear-gradient(90deg,#FF6A1A,#F5A524)]" />
        </div>
        <p className="mt-1.5 text-right text-[10px] text-white/50">80%</p>
      </Flutuante>
      <Flutuante>
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F5B544]/15 text-[#F5B544]">
            <ShoppingBasket className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Supermercado</p>
            <p className="text-[11px] text-white/50">Alimentação</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full border border-positive/25 bg-positive/10 px-2 py-0.5 text-[10px] text-positive">Paga</span>
          <span className="text-sm font-semibold tabular-nums text-negative">-R$ 284,90</span>
        </div>
      </Flutuante>
      <Flutuante className="hidden lg:block" longe>
        <p className="text-xs text-white/60">Receitas</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-positive">{DADOS.receitas}</p>
        <p className="mt-1 text-[11px] text-white/50">+3,4% vs mês anterior</p>
      </Flutuante>
    </>
  );
}

/* --- Palco --- */

/**
 * Hero + narrativa do produto numa única cena presa à tela.
 *
 * A seção é alta (o "trilho" de rolagem) e o palco dentro dela é `sticky`:
 * o scroll nativo continua funcionando, e a posição dentro do trilho vira o
 * progresso de uma timeline GSAP com `scrub` — rolar para baixo avança, rolar
 * para cima volta, sem animações que disparam sozinhas.
 *
 * Um único iPhone atravessa todas as cenas (hero → início → transações →
 * metas → lateral e traseira → análises → vista explodida), então as seções
 * não se "trocam": o objeto principal conduz a transição.
 *
 * Celular: o aparelho fica centralizado e menor, os textos sobem para o topo
 * e as rotações são mais contidas. Menos movimento no sistema: a timeline não
 * é criada e a seção vira um bloco estático (hero + aparelho de frente).
 */
export function ScrollStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const secao = root.current;
    if (!secao) return;
    const palco = secao.querySelector<HTMLElement>("[data-stage]");
    if (!palco) return;

    // Escala do aparelho conforme a tela: cabe na altura e na largura.
    const ajustarEscala = () => {
      const desktop = window.innerWidth >= 1024;
      const porAltura = (window.innerHeight * (desktop ? 0.8 : 0.66)) / 817;
      const porLargura = (window.innerWidth * (desktop ? 0.34 : 0.72)) / 390;
      palco.style.setProperty("--dscale", Math.min(desktop ? 0.95 : 0.8, porAltura, porLargura).toFixed(3));
    };
    ajustarEscala();
    // Só recalcula em mudança real (girar o aparelho, redimensionar a janela),
    // não quando a barra de endereço do celular aparece ou some ao rolar.
    let ultimaLargura = window.innerWidth;
    let ultimaAltura = window.innerHeight;
    const aoRedimensionar = () => {
      if (window.innerWidth === ultimaLargura && Math.abs(window.innerHeight - ultimaAltura) < 140) return;
      ultimaLargura = window.innerWidth;
      ultimaAltura = window.innerHeight;
      ajustarEscala();
    };
    window.addEventListener("resize", aoRedimensionar);

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      },
      (contexto) => {
        const d = Boolean(contexto.conditions?.desktop);
        const q = gsap.utils.selector(secao);

        const rig = q("[data-rig]");
        const device = q("[data-rig] [data-device]");
        const heroCopy = q("[data-hero-copy]");
        const cue = q("[data-cue]");
        const planeta = q("[data-planet]");
        const glare = q("[data-rig] [data-glare]");
        const telaConteudo = q("[data-rig] [data-screen-content]");
        const explodida = q("[data-rig] [data-explode-root]");
        const camadas = q("[data-rig] [data-layer]");
        const flutuantes = q("[data-float]");
        const cena = (id: string) => q(`[data-scene="${id}"]`);
        const tela = (id: string) => q(`[data-screen="${id}"]`);

        const vw = (n: number) => () => (window.innerWidth * n) / 100;
        const vh = (n: number) => () => (window.innerHeight * n) / 100;

        // Posições finais dos cartões ao redor do aparelho (x, y, z, opacidade, deriva).
        const orbitas = d
          ? [
              { x: -0.25, y: -0.04, z: 140, a: 1, drift: 40 },
              { x: 0.25, y: 0, z: 70, a: 1, drift: 60 },
              { x: -0.23, y: 0.27, z: 30, a: 1, drift: 20 },
              { x: 0.24, y: 0.3, z: -120, a: 0.45, drift: 10 },
            ]
          : [
              // Celular: só dois cartões, nas bordas, sem cobrir a tela do aparelho.
              { x: -0.27, y: -0.04, z: 90, a: 1, drift: 20 },
              { x: 0, y: 0, z: 0, a: 0, drift: 0 },
              { x: 0.27, y: 0.3, z: 60, a: 1, drift: 28 },
              { x: 0, y: 0, z: 0, a: 0, drift: 0 },
            ];

        const saldo = { v: 0 };
        const contadores = q("[data-rig] [data-count]");
        const pintarSaldo = () => contadores.forEach((el) => (el.textContent = brl.format(saldo.v)));

        // Estado inicial (reversível: a timeline volta exatamente para cá).
        gsap.set(rig, { xPercent: -50, yPercent: -50, x: 0, y: vh(d ? 54 : 46), scale: d ? 0.9 : 0.95 });
        gsap.set(device, { rotationX: 8, rotationY: 0, rotation: 0 });
        gsap.set(q("[data-scene]"), { autoAlpha: 0 });
        gsap.set(q("[data-scene] [data-line]"), { yPercent: 110 });
        gsap.set(flutuantes, { xPercent: -50, yPercent: -50, x: 0, y: 0, z: -220, scale: 0.6, autoAlpha: 0 });
        gsap.set([tela("tx"), tela("goals"), tela("an")], { autoAlpha: 0 });
        gsap.set(explodida, { autoAlpha: 0 });
        gsap.set(camadas, { z: 0 });
        gsap.set(q("[data-rig] [data-screen] [data-bar]"), { scaleY: 0 });
        gsap.set(q("[data-rig] [data-goalbar]"), { scaleX: 0 });
        gsap.set(q("[data-rig] [data-row]"), { autoAlpha: 0, y: 24 });
        pintarSaldo();

        // Entrada e saída das cenas de texto: linhas sobem por trás da máscara.
        const entra = (id: string, em: number) => {
          tl.to(cena(id), { autoAlpha: 1, duration: 0.15 }, em).to(
            q(`[data-scene="${id}"] [data-line]`),
            { yPercent: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" },
            em,
          );
        };
        const sai = (id: string, em: number) => {
          tl.to(q(`[data-scene="${id}"] [data-line]`), { yPercent: -110, stagger: 0.05, duration: 0.35, ease: "power2.in" }, em).to(
            cena(id),
            { autoAlpha: 0, duration: 0.1 },
            em + 0.35,
          );
        };
        const troca = (de: string, para: string, em: number) => {
          tl.to(tela(de), { autoAlpha: 0, duration: 0.12 }, em).to(tela(para), { autoAlpha: 1, duration: 0.12 }, em);
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: secao,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // 0 → 1,4 · o hero sai, o aparelho sobe ao centro e o início "acorda".
        tl.to(heroCopy, { y: -120, autoAlpha: 0, duration: 0.7, ease: "power1.in" }, 0)
          .to(cue, { autoAlpha: 0, duration: 0.2 }, 0)
          .to(planeta, { y: vh(24), autoAlpha: 0.45, duration: 1.2 }, 0)
          .to(rig, { y: 0, scale: 1, duration: 1 }, 0)
          .to(device, { rotationX: 0, duration: 1 }, 0)
          .to(saldo, { v: DADOS.saldo, duration: 0.9, onUpdate: pintarSaldo }, 0.15)
          .to(q("[data-screen='dash'] [data-bar]"), { scaleY: 1, stagger: 0.05, duration: 0.5 }, 0.5)
          .to(q("[data-screen='dash'] [data-dash-scroll]"), { y: -330, duration: 1.1, ease: "power1.inOut" }, 1);

        // 1,4 → 2,8 · cena A: gira para a direita, texto à esquerda.
        tl.to(rig, { x: vw(d ? 18 : 0), y: d ? 0 : vh(17), scale: d ? 1 : 0.8, duration: 1 }, 1.4)
          .to(device, { rotationY: d ? -22 : -14, rotationX: 6, duration: 1 }, 1.4)
          .to(glare, { xPercent: 60, duration: 1 }, 1.4);

        // 2,8 → 4,2 · cena B: cruza para a esquerda, tela de transações.
        tl.to(rig, { x: vw(d ? -18 : 0), duration: 1 }, 2.9)
          .to(device, { rotationY: d ? 24 : 14, rotationX: 4, rotation: -2, duration: 1 }, 2.9)
          .to(glare, { xPercent: 180, duration: 1 }, 2.9);
        troca("dash", "tx", 3.2);
        tl.to(q("[data-rig] [data-row]"), { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.3 }, 3.35)
          .to(q("[data-rig] [data-tx-scroll]"), { y: -430, duration: 0.8, ease: "power1.inOut" }, 3.7);

        // 4,2 → 6 · cena C: de volta ao centro, câmera aproxima, cartões saem da tela.
        tl.to(rig, { x: 0, y: vh(d ? 14 : 19), scale: d ? 0.76 : 0.74, duration: 0.9 }, 4.3)
          .to(device, { rotationY: 0, rotationX: 0, rotation: 0, duration: 0.9 }, 4.3)
          .to(glare, { xPercent: 0, duration: 0.9 }, 4.3)
          .to(palco, { perspective: d ? 1100 : 900, duration: 1.2 }, 4.3);
        troca("tx", "goals", 4.5);
        tl.to(q("[data-rig] [data-goalbar]"), { scaleX: 1, stagger: 0.1, duration: 0.5 }, 4.7)
          .to(
            flutuantes,
            {
              x: (i) => vw(orbitas[i]?.x * 100 || 0)(),
              y: (i) => vh(orbitas[i]?.y * 100 || 0)(),
              z: (i) => orbitas[i]?.z ?? 0,
              scale: 1,
              autoAlpha: (i) => orbitas[i]?.a ?? 0,
              stagger: 0.06,
              duration: 0.7,
              ease: "power2.out",
            },
            4.8,
          )
          .to(flutuantes, { y: (i) => vh(orbitas[i]?.y * 100 || 0)() - (orbitas[i]?.drift ?? 0), duration: 0.45 }, 5.5);

        // 6 → 8,4 · cena D/E: lateral, traseira (câmeras) e volta com análises.
        tl.to(flutuantes, { x: 0, y: 0, z: -220, scale: 0.6, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 6)
          .to(palco, { perspective: d ? 1400 : 1000, duration: 0.8 }, 6)
          .to(rig, { x: vw(d ? -14 : 0), y: d ? 0 : vh(17), scale: d ? 0.95 : 0.8, duration: 0.8 }, 6.1)
          .to(device, { rotationY: 70, rotationX: -4, duration: 0.6, ease: "power1.inOut" }, 6.1)
          .to(device, { rotationY: 180, rotationX: -6, rotation: 3, duration: 0.6, ease: "power1.inOut" }, 6.7);
        troca("goals", "an", 6.95);
        tl.to(device, { rotationY: 348, rotationX: 4, rotation: 0, duration: 0.8, ease: "power1.inOut" }, 7.4)
          .to(rig, { x: vw(d ? 18 : 0), duration: 0.8 }, 7.4)
          .to(q("[data-screen='an'] [data-bar]"), { scaleY: 1, stagger: 0.05, duration: 0.4 }, 7.9);

        // 8,5 → 10,4 · cena F: vista explodida — as camadas do início se separam e voltam.
        troca("an", "dash", 8.55);
        tl.to(q("[data-screen='dash'] [data-dash-scroll]"), { y: 0, duration: 0.1 }, 8.55)
          .to(rig, { x: vw(d ? 12 : 0), y: vh(d ? 4 : 20), scale: d ? 0.8 : 0.7, duration: 0.8 }, 8.5)
          .to(device, { rotationY: 360, rotationX: d ? 40 : 36, rotation: d ? -22 : -18, duration: 0.8, ease: "power1.inOut" }, 8.5)
          .to(explodida, { autoAlpha: 1, duration: 0.05 }, 9.05)
          .to(telaConteudo, { autoAlpha: 0, duration: 0.05 }, 9.05)
          .to(camadas, { z: (_, el) => Number((el as HTMLElement).dataset.z ?? 0) * (d ? 1 : 0.6), duration: 0.6, ease: "power2.out" }, 9.1)
          .to(camadas, { z: 0, duration: 0.5, ease: "power2.in" }, 9.9)
          .to(explodida, { autoAlpha: 0, duration: 0.05 }, 10.4)
          .to(telaConteudo, { autoAlpha: 1, duration: 0.05 }, 10.4);

        // Textos das cenas (entrada e saída), na mesma timeline.
        entra("a", 1.8);
        sai("a", 2.8);
        entra("b", 3.3);
        sai("b", 4.2);
        entra("c", 4.6);
        sai("c", 6);
        entra("d", 6.3);
        sai("d", 7.4);
        entra("e", 7.7);
        sai("e", 8.5);
        entra("f", 9.1);
        sai("f", 9.9);

        // 10,3 → 11 · o aparelho volta de frente e prepara a próxima seção.
        tl.to(device, { rotationX: 0, rotation: 0, duration: 0.6 }, 10.3)
          .to(rig, { x: 0, y: vh(-2), scale: d ? 0.9 : 0.84, duration: 0.6 }, 10.3)
          .to({}, { duration: 0.3 }, 10.9);

        return () => {
          contadores.forEach((el) => (el.textContent = brl.format(DADOS.saldo)));
        };
      },
    );

    return () => {
      window.removeEventListener("resize", aoRedimensionar);
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative h-[640vh] motion-reduce:h-auto lg:h-[760vh]"
      aria-label="Conheça a NexosFinn"
    >
      {/* Âncora de "Recursos" no cabeçalho: cobre o trecho das cenas do produto. */}
      <div id="recursos" className="pointer-events-none absolute inset-x-0 bottom-[100vh] top-[90vh] motion-reduce:hidden" />

      <div
        data-stage
        className="sticky top-0 h-[100svh] overflow-hidden [--dscale:0.62] [perspective-origin:50%_45%] [perspective:1000px] motion-reduce:relative motion-reduce:h-auto motion-reduce:pb-24 lg:[--dscale:0.82] lg:[perspective:1400px]"
      >
        {/* Fundo: luz ambiente e grade discreta. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,95,20,0.16),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(60%_55%_at_50%_35%,black,transparent)]" />
        </div>

        {/* Planeta: a linha do horizonte atrás do aparelho. */}
        {/*
         * O planeta tem ~1800px, mas só a calota de cima aparece. O contêiner
         * recorta essa faixa (com folga para o halo, que some num degradê de
         * máscara em vez de terminar numa linha reta), e é ele que a timeline
         * move: a camada na GPU fica do tamanho do que se vê.
         */}
        <div
          data-planet
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[calc(64svh-320px)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_260px)] motion-reduce:top-[200px] lg:top-[calc(60vh-320px)]"
        >
          <div className="absolute left-1/2 top-[320px] w-[230vw] -translate-x-1/2 lg:w-[max(1500px,120vw)]">
            <Planet className="relative w-full" />
          </div>
        </div>

        {/* Hero. */}
        <div
          data-hero-copy
          className="relative z-20 mx-auto flex max-w-6xl flex-col items-center px-5 pt-[calc(6.5rem+env(safe-area-inset-top,0px))] text-center lg:pt-[15vh]"
        >
          <span className="hero-rise block" style={{ animationDelay: "60ms" }}>
            <Eyebrow>Open Finance · seus bancos em um só lugar</Eyebrow>
          </span>
          <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1] tracking-[-0.05em] min-[400px]:text-5xl lg:text-[clamp(3.25rem,5.6vw,5.75rem)]">
            <span className="hero-line block overflow-hidden pb-[0.08em]">
              <span className="block" style={{ animationDelay: "100ms" }}>
                Suas finanças.
              </span>
            </span>
            <span className="hero-line block overflow-hidden pb-[0.1em]">
              <span className="block" style={{ animationDelay: "180ms" }}>
                <span className="font-display">Finalmente</span> organizadas.
              </span>
            </span>
          </h1>
          <p
            className="hero-rise mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "250ms" }}
          >
            A NexosFinn organiza seus gastos sozinha, mostra para onde seu dinheiro vai e ajuda você a chegar nas suas
            metas.
          </p>
          <div className="hero-rise mt-7 flex w-full flex-row justify-center gap-2.5 sm:w-auto sm:gap-3" style={{ animationDelay: "350ms" }}>
            <Link
              href="/cadastro"
              className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 text-[13px] font-semibold text-[#0A0A0A] sm:px-6 sm:text-sm shadow-[0_10px_30px_-10px_rgba(255,255,255,0.35)] transition-[transform,box-shadow] duration-300 ease-out-expo hover:scale-[1.02] active:scale-100 sm:flex-none"
            >
              Abrir minha conta
              <ArrowUpRight className="hidden size-4 transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 min-[400px]:block" />
            </Link>
            <a
              href="#recursos"
              className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[13px] font-semibold sm:px-6 sm:text-sm text-foreground transition-[transform,background-color,border-color] duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.09] sm:flex-none"
            >
              Ver como funciona
            </a>
          </div>
          <p className="hero-rise mt-3 hidden text-xs text-muted-foreground sm:block" style={{ animationDelay: "420ms" }}>
            Grátis para começar · sem cartão de crédito
          </p>
        </div>

        {/* Textos das cenas. No modo sem movimento, viram uma lista estática abaixo do aparelho. */}
        <div className="motion-reduce:hidden">
          {CENAS.map((cena) => (
            <CenaTexto key={cena.id} cena={cena} />
          ))}
        </div>

        {/* Cartões que saem do aparelho (cena C). */}
        <div className="pointer-events-none absolute inset-0 z-30 [transform-style:preserve-3d] motion-reduce:hidden">
          <CartoesFlutuantes />
        </div>

        {/* O aparelho. */}
        <div
          data-rig
          className="absolute left-1/2 top-1/2 z-10 will-change-transform [transform-style:preserve-3d] motion-reduce:relative motion-reduce:left-auto motion-reduce:top-auto motion-reduce:mx-auto motion-reduce:mt-14"
          style={{ width: "calc(390px * var(--dscale))", height: "calc(817px * var(--dscale))" }}
        >
          <div className="device-entry size-full [transform-style:preserve-3d]">
            <div
              className="[transform-style:preserve-3d]"
              style={{ transform: "scale(var(--dscale))", transformOrigin: "0 0", width: 390, height: 817 }}
            >
              <IPhone17ProMax
                screen={
                  <div className="relative size-full">
                    <div data-screen="dash" className="absolute inset-0">
                      <ScreenDashboard />
                    </div>
                    <div data-screen="tx" className="absolute inset-0 opacity-0 motion-reduce:hidden">
                      <ScreenTransactions />
                    </div>
                    <div data-screen="goals" className="absolute inset-0 opacity-0 motion-reduce:hidden">
                      <ScreenGoals />
                    </div>
                    <div data-screen="an" className="absolute inset-0 opacity-0 motion-reduce:hidden">
                      <ScreenAnalytics />
                    </div>
                  </div>
                }
                explode={
                  <div data-explode-root className="absolute inset-0 opacity-0 [transform-style:preserve-3d] motion-reduce:hidden">
                    <ExplodedDashboard />
                  </div>
                }
              />
            </div>
          </div>
          {/* Sombra de contato. */}
          <div
            aria-hidden="true"
            className="absolute -bottom-12 left-1/2 h-16 w-[90%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,0,0,0.75),transparent)]"
          />
        </div>

        {/* Versão estática das cenas, para quem prefere menos movimento. */}
        <div className="mx-auto hidden max-w-5xl gap-10 px-5 pt-16 motion-reduce:grid md:grid-cols-2">
          {CENAS.map((cena) => (
            <div key={cena.id}>
              <Eyebrow>{cena.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{cena.titulo}</h2>
              <p className="mt-3 text-muted-foreground">{cena.texto}</p>
            </div>
          ))}
        </div>

        {/* Indicador de rolagem. */}
        <div
          data-cue
          aria-hidden="true"
          className="hero-rise absolute bottom-8 left-[7vw] z-20 hidden items-center gap-3 text-xs text-muted-foreground lg:flex motion-reduce:!hidden"
          style={{ animationDelay: "900ms" }}
        >
          <span className="relative h-10 w-[22px] rounded-full border border-white/20">
            <span className="absolute left-1/2 top-2 h-2 w-[3px] -translate-x-1/2 animate-[nf-cue_1.8s_ease-in-out_infinite] rounded-full bg-primary" />
          </span>
          Role para explorar
        </div>
      </div>
    </section>
  );
}
