import type { Metadata } from "next";

import { ClosingScene } from "@/components/landing/closing-scene";
import { DesktopScene } from "@/components/landing/desktop-scene";
import { FAQ } from "@/components/landing/faq";
import { LandingHeader } from "@/components/landing/header";
import { Pricing } from "@/components/landing/pricing";
import { ScrollStory } from "@/components/landing/scroll-story";
import { Integrations, LandingFooter, Security, TrustBar } from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "NexosFinn — Suas finanças sob controle",
  description:
    "A NexosFinn organiza seus gastos sozinha, mostra para onde seu dinheiro vai e responde às suas perguntas sobre ele. Comece grátis, sem cartão de crédito.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NexosFinn — Suas finanças sob controle",
    description:
      "Categorização automática, orçamento por categoria e metas com aporte calculado. Comece grátis.",
    type: "website",
    locale: "pt_BR",
  },
};

/**
 * Página de vendas.
 *
 * Totalmente estática: nada aqui lê cookie ou consulta a API, então o Next a
 * prerenderiza no build e a entrega direto da borda.
 *
 * Ritmo da página: impacto (hero + narrativa do iPhone presa à tela) → calma
 * (faixa de confiança) → impacto (o painel desktop inclinando até ficar de
 * frente) → informação (integrações, segurança, planos, dúvidas) → conversão
 * (encerramento com o aparelho assentando de frente). As animações ligadas ao
 * scroll usam GSAP + ScrollTrigger sobre o scroll nativo; quem pede menos
 * movimento no sistema recebe a mesma página, estática.
 *
 * A página é sempre escura, independentemente do tema escolhido no app: a
 * identidade da marca (preto + luz laranja) é a própria peça de venda. A
 * classe `dark` no contêiner redefine os tokens só aqui dentro.
 *
 * O aplicativo autenticado vive em /app/*; a raiz é o território público.
 */
export default function LandingPage() {
  return (
    <div className="dark min-h-dvh overflow-x-clip bg-background text-foreground [color-scheme:dark]">
      <LandingHeader />

      <main>
        <ScrollStory />
        <TrustBar />
        <DesktopScene />
        <Integrations />
        <Security />
        <Pricing />
        <FAQ />
        <ClosingScene />
      </main>

      <LandingFooter />
    </div>
  );
}
