"use client";

/**
 * Barra arredondada que cresce da base ao montar.
 *
 * A animação de montagem do próprio Recharts termina com o desenho invisível
 * nesta combinação de versões (por isso `isAnimationActive={false}` em todo
 * gráfico do app). Aqui o crescimento é CSS puro sobre o `<rect>` — só
 * `transform`, escalonado por coluna.
 */
export function BarraAnimada(props: any) {
  const { x, y, width, height, fill, index } = props;
  if (!height || height <= 0) return null;

  const raio = Math.min(width / 2, 7);
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={raio}
      ry={raio}
      fill={fill}
      className="grow-y"
      style={{ animationDelay: `${(index ?? 0) * 45}ms` }}
    />
  );
}
