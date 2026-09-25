"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Planeta com luz de borda — o objeto central do vídeo de referência, na cor
 * da marca.
 *
 * O corpo é CSS (gradiente + halo); os pontos do "mapa" são desenhados uma
 * única vez num canvas 2D, projetando uma grade de latitude/longitude numa
 * esfera inclinada: perto da borda os pontos encolhem e escurecem, o que dá a
 * curvatura. Depois disso o canvas não é redesenhado — a timeline só move o
 * contêiner por `transform`, então o custo por quadro é zero.
 *
 * Só a metade de cima da esfera é desenhada (é a única que aparece), e a
 * densidade de pixels é limitada, para não alocar um canvas gigante.
 */
function desenhar(canvas: HTMLCanvasElement) {
  const largura = canvas.clientWidth;
  if (!largura) return;

  const dpr = Math.min(window.devicePixelRatio || 1, largura > 1200 ? 1.25 : 1.5);
  const altura = largura / 2;
  canvas.width = Math.round(largura * dpr);
  canvas.height = Math.round(altura * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, largura, altura);

  const R = largura / 2;
  const inclinacao = 0.62;
  const passo = largura > 1200 ? 1.9 : 2.6;
  const rad = Math.PI / 180;

  for (let lat = -86; lat <= 86; lat += passo) {
    const cosLat = Math.cos(lat * rad);
    const passoLon = passo / Math.max(cosLat, 0.2);

    for (let lon = 0; lon < 360; lon += passoLon) {
      // "Continentes": combinação de ondas de baixa frequência, determinística.
      const ruido =
        Math.sin(lon * 0.045 + 1.3) * Math.cos(lat * 0.07) +
        Math.sin(lon * 0.11 + lat * 0.05) * 0.6 +
        Math.cos(lat * 0.13 - lon * 0.031) * 0.5;
      if (ruido < 0.32) continue;

      const x = cosLat * Math.sin(lon * rad);
      const y = Math.sin(lat * rad);
      const z = cosLat * Math.cos(lon * rad);
      const y2 = y * Math.cos(inclinacao) - z * Math.sin(inclinacao);
      const z2 = y * Math.sin(inclinacao) + z * Math.cos(inclinacao);
      if (z2 <= 0.02 || y2 < 0) continue;

      const sx = R + x * R * 0.985;
      const sy = R - y2 * R * 0.985;
      const borda = 1 - z2; // 0 no centro do disco, 1 na borda
      const alpha = 0.12 + 0.55 * z2 + 0.3 * Math.pow(borda, 3);

      ctx.fillStyle = `rgba(255, ${Math.round(128 + 70 * z2)}, ${Math.round(60 + 40 * z2)}, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.55 + 1.25 * z2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function Planet({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    desenhar(canvas);
    let ultimaLargura = canvas.clientWidth;
    const observer = new ResizeObserver(() => {
      // Redesenha só quando a largura muda de verdade (girar o celular, etc.).
      if (Math.abs(canvas.clientWidth - ultimaLargura) < 40) return;
      ultimaLargura = canvas.clientWidth;
      desenhar(canvas);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none aspect-square rounded-full", className)}>
      {/* Halo de atmosfera: luz ambiente, não neon. */}
      <div className="absolute inset-0 rounded-full shadow-[0_0_140px_40px_rgba(255,106,26,0.22),0_0_40px_6px_rgba(255,130,60,0.3)]" />
      {/* Corpo escuro com a borda iluminada por cima. */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_8%,#2a1206_0%,#0d0603_32%,#050505_60%)] shadow-[inset_0_22px_50px_-12px_rgba(255,140,60,0.8),inset_0_2px_0_rgba(255,205,160,0.9)]" />
      <canvas ref={canvasRef} className="absolute inset-x-0 top-0 h-1/2 w-full rounded-t-full opacity-90" />
      {/* Brilho especular no topo da borda. */}
      <div className="absolute inset-x-[22%] top-0 h-[3px] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,225,190,0.95),transparent)] blur-[1px]" />
    </div>
  );
}
