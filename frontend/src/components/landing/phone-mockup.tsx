/**
 * Aparelho com a tela principal do aplicativo.
 *
 * Desenhado em marcação e SVG, não em imagem: fica nítido em qualquer
 * densidade de tela, acompanha o tema, não gera requisição de rede e não
 * causa deslocamento de layout — a moldura tem proporção fixa.
 */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]" style={{ aspectRatio: "300 / 610" }}>
      {/* Halo por trás do aparelho */}
      <div
        className="pointer-events-none absolute -inset-10 rounded-[999px] bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative h-full rounded-[44px] border border-border bg-card p-3 shadow-card">
        <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[32px] bg-background p-4">
          {/* Barra de status */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-medium">9:41</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="h-2 w-3 rounded-[2px] bg-muted-foreground/50" />
              <span className="h-2 w-3 rounded-[2px] bg-muted-foreground/50" />
              <span className="h-2 w-5 rounded-[3px] border border-muted-foreground/50" />
            </span>
          </div>

          {/* Saldo */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] text-muted-foreground">Saldo total</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">R$ 7.580,50</p>
            <p className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="font-semibold text-positive">↑ 12,5%</span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </p>
          </div>

          {/* Evolução */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] text-muted-foreground">Evolução do saldo</p>
            <svg viewBox="0 0 240 80" className="mt-2 h-16 w-full" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="mockup-area" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 62 L30 58 L60 63 L90 44 L120 48 L150 30 L180 34 L210 16 L240 10 V80 H0 Z"
                fill="url(#mockup-area)"
              />
              <path
                d="M0 62 L30 58 L60 63 L90 44 L120 48 L150 30 L180 34 L210 16 L240 10"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="240" cy="10" r="4" fill="hsl(var(--primary))" />
            </svg>
          </div>

          {/* Categorias */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] text-muted-foreground">Gastos por categoria</p>
            <ul className="mt-3 space-y-2.5">
              {[
                { nome: "Moradia", pct: 42, cor: "hsl(var(--primary))" },
                { nome: "Alimentação", pct: 27, cor: "hsl(var(--accent))" },
                { nome: "Transporte", pct: 17, cor: "hsl(var(--muted-foreground))" },
              ].map((item) => (
                <li key={item.nome} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-foreground">{item.nome}</span>
                    <span className="tabular-nums text-muted-foreground">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, backgroundColor: item.cor }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
