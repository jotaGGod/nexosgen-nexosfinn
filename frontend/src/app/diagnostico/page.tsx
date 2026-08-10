"use client";

import { useEffect, useState } from "react";

/**
 * Página de diagnóstico da área de tela.
 *
 * Existe para responder, no aparelho do usuário, uma pergunta que não dá para
 * responder no computador: o app instalado está mesmo recebendo a tela inteira?
 *
 * As faixas pretas do iOS têm duas causas possíveis, e elas pedem correções
 * opostas. Ou a página desenha na tela toda e apenas deixa a área segura sem
 * pintar — problema de CSS —, ou o próprio sistema entrega uma janela menor que
 * a tela e sobra moldura em volta — aí nenhum CSS resolve, a correção é de
 * configuração do app instalado. Comparar a altura da janela com a altura
 * física da tela separa um caso do outro.
 */

interface Medida {
  label: string;
  valor: string;
  ok?: boolean;
  nota?: string;
}

export default function DiagnosticoPage() {
  const [medidas, setMedidas] = useState<Medida[] | null>(null);
  const [veredito, setVeredito] = useState<{ texto: string; ok: boolean } | null>(null);

  useEffect(() => {
    function medir() {
      // As inserções de área segura só existem como valor calculado; um
      // elemento sonda com padding em env() é a forma de lê-las em número.
      const sonda = document.createElement("div");
      sonda.style.cssText = [
        "position:fixed",
        "top:0",
        "left:0",
        "visibility:hidden",
        "pointer-events:none",
        "padding-top:env(safe-area-inset-top,0px)",
        "padding-bottom:env(safe-area-inset-bottom,0px)",
        "padding-left:env(safe-area-inset-left,0px)",
        "padding-right:env(safe-area-inset-right,0px)",
      ].join(";");
      document.body.appendChild(sonda);
      const estilo = getComputedStyle(sonda);
      const inset = {
        top: parseFloat(estilo.paddingTop) || 0,
        bottom: parseFloat(estilo.paddingBottom) || 0,
        left: parseFloat(estilo.paddingLeft) || 0,
        right: parseFloat(estilo.paddingRight) || 0,
      };
      sonda.remove();

      const alturaJanela = window.innerHeight;
      const alturaTela = window.screen.height;
      const larguraJanela = window.innerWidth;
      const larguraTela = window.screen.width;

      const instalado =
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches;

      // Em retrato, janela e tela devem praticamente coincidir quando o app
      // ocupa tudo. Uma diferença grande é a moldura que aparece como faixa.
      const sobra = alturaTela - alturaJanela;
      const ocupaTudo = sobra <= 24;

      setMedidas([
        {
          label: "Modo de exibição",
          valor: instalado ? "App instalado (standalone)" : "Navegador",
          ok: instalado,
          nota: instalado
            ? "Correto: aberto pelo ícone da tela de início."
            : "Abra pelo ícone na tela de início — no Safari as barras são do navegador.",
        },
        {
          label: "Altura da janela",
          valor: `${alturaJanela}px`,
          nota: "Espaço que o sistema entregou para a página.",
        },
        {
          label: "Altura física da tela",
          valor: `${alturaTela}px`,
          nota: "Tela inteira do aparelho.",
        },
        {
          label: "Diferença (moldura)",
          valor: `${sobra}px`,
          ok: ocupaTudo,
          nota: ocupaTudo
            ? "A janela cobre a tela: as faixas seriam só de pintura."
            : "A janela é menor que a tela: as faixas são moldura do sistema.",
        },
        {
          label: "Largura janela / tela",
          valor: `${larguraJanela}px / ${larguraTela}px`,
        },
        {
          label: "Área segura topo",
          valor: `${inset.top}px`,
          ok: inset.top > 0,
          nota:
            inset.top > 0
              ? "viewport-fit=cover ativo: a página enxerga o recorte."
              : "Zero em aparelho com recorte indica viewport-fit=cover inativo.",
        },
        {
          label: "Área segura base",
          valor: `${inset.bottom}px`,
        },
        {
          label: "Densidade de pixels",
          valor: `${window.devicePixelRatio}x`,
        },
      ]);

      if (!instalado) {
        setVeredito({
          texto:
            "Aberto no navegador. Adicione à tela de início e abra pelo ícone para o teste valer.",
          ok: false,
        });
      } else if (ocupaTudo) {
        setVeredito({
          texto:
            "O app recebeu a tela inteira. Se ainda houver faixa, é pintura de fundo — corrige-se no CSS.",
          ok: true,
        });
      } else {
        setVeredito({
          texto: `O sistema entregou ${sobra}px a menos que a tela. As faixas são moldura do app instalado, não CSS — a correção é na configuração e exige reinstalar o app.`,
          ok: false,
        });
      }
    }

    medir();
    window.addEventListener("resize", medir);
    window.addEventListener("orientationchange", medir);
    return () => {
      window.removeEventListener("resize", medir);
      window.removeEventListener("orientationchange", medir);
    };
  }, []);

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/*
       * Réguas nas bordas absolutas da página. Elas são a leitura visual do
       * teste: se a faixa limão encosta no vidro do aparelho — sumindo por
       * baixo do relógio, no topo, e do indicador de início, na base — a página
       * está usando a tela toda. Se sobrar preto além delas, existe moldura.
       */}
      <div className="fixed inset-x-0 top-0 z-50 h-2 bg-primary" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-50 h-2 bg-accent" aria-hidden />
      <div className="fixed inset-y-0 left-0 z-50 w-2 bg-primary/70" aria-hidden />
      <div className="fixed inset-y-0 right-0 z-50 w-2 bg-primary/70" aria-hidden />

      <div className="safe-area-page mx-auto w-full max-w-md space-y-5 py-10">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Diagnóstico
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Área de tela</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            A faixa limão marca o topo absoluto da página e a roxa, a base. Se as duas encostam nas
            bordas do aparelho, a tela está sendo usada por inteiro.
          </p>
        </header>

        {veredito ? (
          <div
            className={`surface p-5 ${
              veredito.ok ? "border-positive/40" : "border-negative/40"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Veredito
            </p>
            <p
              className={`mt-2 text-sm font-semibold leading-relaxed ${
                veredito.ok ? "text-positive" : "text-negative"
              }`}
            >
              {veredito.texto}
            </p>
          </div>
        ) : null}

        <div className="surface divide-y divide-border/70 overflow-hidden">
          {medidas?.map((medida) => (
            <div key={medida.label} className="p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-muted-foreground">{medida.label}</span>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    medida.ok === undefined
                      ? "text-foreground"
                      : medida.ok
                        ? "text-positive"
                        : "text-negative"
                  }`}
                >
                  {medida.valor}
                </span>
              </div>
              {medida.nota ? (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{medida.nota}</p>
              ) : null}
            </div>
          ))}
          {!medidas ? <div className="p-4 text-sm text-muted-foreground">Medindo…</div> : null}
        </div>

        {/* Conteúdo alto de propósito: rolar mostra se o conteúdo passa por baixo do relógio. */}
        <div className="surface p-5">
          <p className="text-sm font-semibold">Teste de rolagem</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Role a página. O conteúdo abaixo deve passar por baixo do relógio e da bateria, sem
            parar numa linha reta antes deles.
          </p>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold"
              >
                <span>Linha de teste {i + 1}</span>
                <span className="tabular-nums text-primary">R$ {(i + 1) * 137},40</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
