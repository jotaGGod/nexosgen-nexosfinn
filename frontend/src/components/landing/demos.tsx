/**
 * Demonstrações dos recursos, em SVG animado inline.
 *
 * Nenhuma é vídeo ou GIF, e essa é a escolha de performance mais importante
 * da página: um GIF equivalente pesaria centenas de kilobytes, não escalaria
 * em tela retina e não acompanharia o tema. Aqui cada demonstração custa
 * poucos kilobytes de marcação, é nítida em qualquer densidade e usa as cores
 * do design system.
 *
 * As animações são declaradas em CSS (`animate-*` do tema) e respeitam
 * `prefers-reduced-motion`, tratado globalmente em globals.css.
 */

/** Conversa com o assistente: pergunta, resposta e valor destacado. */
export function DemoAssistente() {
  return (
    <div className="surface flex h-full flex-col justify-center gap-3 p-6">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5">
        <p className="text-sm font-medium text-primary-foreground">
          Quanto gastei com comida esse mês?
        </p>
      </div>

      <div className="max-w-[88%] space-y-3 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <p className="text-sm text-foreground">
          Você gastou <span className="font-semibold tabular-nums">R$ 905,25</span> em Alimentação —
          8% a menos que no mês passado.
        </p>

        <svg viewBox="0 0 200 44" className="h-11 w-full" fill="none" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((indice) => {
            const alturas = [26, 34, 22, 38, 30, 18];
            const altura = alturas[indice];
            return (
              <rect
                key={indice}
                x={indice * 34}
                y={44 - altura}
                width="18"
                height={altura}
                rx="5"
                fill={indice === 5 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                opacity={indice === 5 ? 1 : 0.35}
              />
            );
          })}
        </svg>

        <p className="text-xs text-muted-foreground">
          Mantendo esse ritmo, sobram R$ 320 do seu limite.
        </p>
      </div>
    </div>
  );
}

/** Categorização automática: lançamento bruto vira categoria reconhecida. */
export function DemoCategorizacao() {
  const lancamentos = [
    { descricao: "PADARIA SAO JOAO", categoria: "Alimentação", valor: "R$ 18,50" },
    { descricao: "POSTO IPIRANGA 42", categoria: "Transporte", valor: "R$ 210,00" },
    { descricao: "FARMACIA CENTRAL", categoria: "Saúde", valor: "R$ 67,90" },
  ];

  return (
    <div className="surface flex h-full flex-col justify-center gap-2.5 p-6">
      {lancamentos.map((item, indice) => (
        <div
          key={item.descricao}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
        >
          <span
            className="size-9 shrink-0 rounded-xl bg-primary/12"
            style={{ animation: `pulse-dot 2s ease-in-out ${indice * 0.25}s infinite` }}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[11px] uppercase text-muted-foreground">
              {item.descricao}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
              <span className="text-primary">→</span>
              {item.categoria}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
            {item.valor}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Meta financeira: progresso, prazo e aporte sugerido. */
export function DemoMetas() {
  const progresso = 68;

  return (
    <div className="surface flex h-full flex-col justify-center gap-5 p-6">
      <div className="flex items-center gap-4">
        {/* Anel de progresso: o traço é desenhado por stroke-dasharray. */}
        <svg viewBox="0 0 84 84" className="size-20 shrink-0 -rotate-90" fill="none" aria-hidden="true">
          <circle cx="42" cy="42" r="34" stroke="hsl(var(--muted))" strokeWidth="9" />
          <circle
            cx="42"
            cy="42"
            r="34"
            stroke="hsl(var(--primary))"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 34}
            strokeDashoffset={2 * Math.PI * 34 * (1 - progresso / 100)}
          />
        </svg>

        <div>
          <p className="text-sm text-muted-foreground">Viagem para o Chile</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums">
            R$ 6.800 <span className="text-sm font-normal text-muted-foreground">de R$ 10.000</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Restam 7 meses</p>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary/8 p-4">
        <p className="text-xs text-muted-foreground">Guardando por mês</p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums text-primary">R$ 457,14</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Calculado pelo que falta e pelo prazo que você definiu.
        </p>
      </div>
    </div>
  );
}
