"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const perguntas = [
  {
    pergunta: "A nexosgen-financehub consegue movimentar meu dinheiro?",
    resposta:
      "Não. A conexão com o seu banco é de leitura apenas: conseguimos ver os lançamentos para organizá-los, e nada além disso. Nenhuma transferência, pagamento ou resgate parte da nexosgen-financehub.",
  },
  {
    pergunta: "Como meus bancos são conectados?",
    resposta:
      "Pelo Open Finance, o padrão regulado pelo Banco Central. Você autoriza a conexão no ambiente do seu próprio banco e pode revogá-la quando quiser, tanto por lá quanto por aqui.",
  },
  {
    pergunta: "Preciso lançar cada gasto na mão?",
    resposta:
      "Não. Os lançamentos chegam do banco já categorizados. Você só interfere quando quiser corrigir algo — e, quando corrige, a nexosgen-financehub passa a acertar naquele estabelecimento.",
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
    <section className="mx-auto mt-32 w-full max-w-3xl px-5">
      <div className="text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Dúvidas</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          O que costumam perguntar
        </h2>
      </div>

      <div className="mt-10 space-y-3">
        {perguntas.map((item, indice) => {
          const estaAberta = aberta === indice;

          return (
            <Reveal key={item.pergunta} delay={indice * 40} className="surface overflow-hidden">
              <h3>
                <button
                  type="button"
                  onClick={() => setAberta(estaAberta ? null : indice)}
                  aria-expanded={estaAberta}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium sm:text-base">{item.pergunta}</span>
                  <Plus
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out-expo",
                      estaAberta && "rotate-45 text-primary",
                    )}
                  />
                </button>
              </h3>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out-expo",
                  estaAberta ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.resposta}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
