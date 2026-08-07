import type { Metadata } from "next";

import { FAQ } from "@/components/landing/faq";
import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import {
  FeaturesGrid,
  FinalCTA,
  LandingFooter,
  Security,
  Showcase,
  StatsBar,
} from "@/components/landing/sections";

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
 * prerenderiza no build e a entrega direto da borda. É o que permite o alvo
 * de performance — o custo de JavaScript se resume aos três trechos
 * interativos (cabeçalho, planos e perguntas).
 *
 * O aplicativo autenticado vive em /app/*; a raiz é o território público.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <LandingHeader />

      <main>
        <Hero />
        <StatsBar />
        <FeaturesGrid />
        <Showcase />
        <Security />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
