"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Destaque, Eyebrow, Section } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const perguntas = [
  {
    pergunta: "A NexosFinn consegue movimentar meu dinheiro?",
    resposta:
      "Não. A conexão com o seu banco é de leitura apenas: conseguimos ver os lançamentos para organizá-los, e nada além disso. Nenhuma transferência, pagamento ou resgate parte da NexosFinn.",
  },
  {
    pergunta: "Como meus bancos são conectados?",
    resposta:
      "Pelo Open Finance, o padrão regulado pelo Banco Central. Você autoriza a conexão no ambiente do seu próprio banco e pode revogá-la quando quiser, tanto por lá quanto por aqui.",
  },
  {
    pergunta: "Preciso lançar cada gasto na mão?",
    resposta:
      "Não. Os lançamentos chegam do banco já categorizados. Você só interfere quando quiser corrigir algo — e, quando corrige, a NexosFinn passa a acertar naquele estabelecimento.",
  },
  {
    pergunta: "O que acontece se eu cancelar?",
    resposta:
      "Sua conta volta para o plano gratuito e seus dados continuam lá. Se preferir apagar tudo, a exclusão é definitiva e feita por você mesmo nas configurações.",
  },
  {
    pergunta: "Dá para usar sem conectar banco nenhum?",
    resposta:
      "Dá. Você pode cadastrar contas e lançar manualmente, além de registrar gastos por mensagem. A conexão automática só poupa esse trabalho.",
  },
  {
    pergunta: "Meus dados são vendidos ou compartilhados?",
    resposta:
      "Nunca. Não vendemos, não cedemos e não usamos seus dados para publicidade. Nosso faturamento vem da assinatura, e é justamente isso que mantém o incentivo alinhado com você.",
  },
];

/**
 * Perguntas frequentes em acordeão.
 *
 * Todas as respostas ficam no HTML desde o primeiro carregamento, apenas
 * ocultas: assim o buscador as indexa e a página não faz requisição para
 * abrir um item.
 */
export function FAQ() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <Section id="duvidas">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col items-center text-center lg:sticky lg:top-28 lg:items-start lg:self-start lg:text-left">
          <Eyebrow>Dúvidas</Eyebrow>
          <h2 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            O que costumam <Destaque>perguntar</Destaque>
          </h2>
          <p className="mt-5 max-w-sm text-pretty text-base leading-relaxed text-muted-foreground">
            Segurança, conexão com os bancos e o que acontece com seus dados. Se ficar alguma dúvida, o suporte
            responde de segunda a sexta.
          </p>
        </div>

        <div className="space-y-3">
          {perguntas.map((item, indice) => {
            const estaAberta = aberta === indice;
            const numero = String(indice + 1).padStart(2, "0");

            return (
              <Reveal
                key={item.pergunta}
                delay={indice * 50}
                className={cn(
                  "lp-card overflow-hidden rounded-2xl transition-colors duration-300",
                  estaAberta && "border-white/[0.14] bg-[#101010]",
                )}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setAberta(estaAberta ? null : indice)}
                    aria-expanded={estaAberta}
                    aria-controls={`faq-resposta-${indice}`}
                    className="flex min-h-16 w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground/70">{numero}</span>
                    <span className="flex-1 text-sm font-medium sm:text-base">{item.pergunta}</span>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-[transform,background-color,border-color,color] duration-300 ease-out-expo",
                        estaAberta
                          ? "rotate-45 border-primary/40 bg-primary text-primary-foreground"
                          : "border-white/10 bg-white/[0.04] text-muted-foreground",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-resposta-${indice}`}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo",
                    estaAberta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 pl-[3.25rem] text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pl-[3.6rem]">
                      {item.resposta}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
