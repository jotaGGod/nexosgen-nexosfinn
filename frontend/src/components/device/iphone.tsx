import { cn } from "@/lib/utils";

/**
 * iPhone 17 Pro Max em 3D, só com HTML e CSS.
 *
 * Por que não Three.js: o que precisa aparecer na tela é o aplicativo real,
 * em HTML, animável peça por peça. Num canvas WebGL isso viraria textura (sem
 * nitidez, sem animação interna) e custaria centenas de kB. Aqui o aparelho
 * é uma caixa `preserve-3d` de poucas dezenas de elementos:
 *
 * - frente: vidro preto, anel do chassi, tela e Dynamic Island;
 * - traseira: alumínio laranja-cósmico com o platô de câmeras do 17 Pro;
 * - lateral: faixas finas perpendiculares à frente, contornando o retângulo
 *   arredondado (retas + arcos dos cantos), cada uma já sombreada pela
 *   posição em relação à luz. Girando, elas formam a espessura real do chassi.
 *
 * Proporções do 17 Pro Max (163,4 × 78 × 8,75 mm). O aparelho é desenhado num
 * tamanho fixo e escalado por fora, pelo contêiner, para nunca deformar.
 */

export const DEVICE = { W: 390, H: 817, R: 62, D: 42, INSET: 13 } as const;
/** A tela e a base fixa (430 × 932) em que as telas do app são desenhadas. */
export const SCREEN = { W: DEVICE.W - 2 * DEVICE.INSET, H: DEVICE.H - 2 * DEVICE.INSET, R: DEVICE.R - DEVICE.INSET };
export const CANVAS = { W: 430, H: 932 };
export const CANVAS_SCALE = SCREEN.W / CANVAS.W;

/* --- Sombreamento do chassi (laranja cósmico) --- */

const ESCURO = [96, 34, 8];
const BASE = [226, 98, 32];
const CLARO = [255, 178, 122];
const LUZ = (225 * Math.PI) / 180; // luz vindo do alto à esquerda

function mistura(a: number[], b: number[], t: number) {
  return a.map((canal, i) => Math.round(canal + (b[i] - canal) * t));
}

function corDaFaixa(theta: number) {
  const k = Math.cos(theta - LUZ); // 1 = de frente para a luz, -1 = oposto
  const rgb = k >= 0 ? mistura(BASE, CLARO, k * 0.85) : mistura(BASE, ESCURO, -k * 0.9);
  return `rgb(${rgb.join(" ")})`;
}

interface Faixa {
  left: number;
  top: number;
  width: number;
  height: number;
  phi: number;
  cor: string;
}

/**
 * Faixa perpendicular à frente, centrada em (cx, cy), com a normal apontando
 * para `theta` (ângulo em coordenadas de tela, y para baixo).
 */
function faixa(cx: number, cy: number, theta: number, largura: number, altura: number = DEVICE.D): Faixa {
  return {
    left: +(cx - largura / 2).toFixed(2),
    top: +(cy - altura / 2).toFixed(2),
    width: +largura.toFixed(2),
    height: altura,
    phi: +(((theta * 180) / Math.PI + 90) % 360).toFixed(2),
    cor: corDaFaixa(theta),
  };
}

function montarLateral(): Faixa[] {
  const { W, H, R } = DEVICE;
  const faixas: Faixa[] = [];
  const PASSOS = 7;
  const delta = Math.PI / 2 / PASSOS;
  const raioCorda = R * Math.cos(delta / 2);
  const corda = 2 * R * Math.sin(delta / 2) + 0.9; // leve sobreposição: sem frestas

  const cantos: [number, number, number][] = [
    [R, R, Math.PI], // superior esquerdo: 180° → 270°
    [W - R, R, 1.5 * Math.PI], // superior direito: 270° → 360°
    [W - R, H - R, 0], // inferior direito: 0° → 90°
    [R, H - R, 0.5 * Math.PI], // inferior esquerdo: 90° → 180°
  ];

  for (const [cx, cy, inicio] of cantos) {
    for (let i = 0; i < PASSOS; i++) {
      const theta = inicio + delta * (i + 0.5);
      faixas.push(faixa(cx + raioCorda * Math.cos(theta), cy + raioCorda * Math.sin(theta), theta, corda));
    }
  }

  faixas.push(faixa(0, H / 2, Math.PI, H - 2 * R + 1)); // esquerda
  faixas.push(faixa(W, H / 2, 0, H - 2 * R + 1)); // direita
  faixas.push(faixa(W / 2, 0, 1.5 * Math.PI, W - 2 * R + 1)); // topo
  faixas.push(faixa(W / 2, H, 0.5 * Math.PI, W - 2 * R + 1)); // base

  // Botões: pequenas faixas 1,5px para fora da lateral.
  const botao = (lado: "esq" | "dir", y: number, comprimento: number) =>
    faixa(lado === "esq" ? -1.5 : W + 1.5, y, lado === "esq" ? Math.PI : 0, comprimento, DEVICE.D * 0.42);
  faixas.push(botao("esq", H * 0.2, 34)); // botão de ação
  faixas.push(botao("esq", H * 0.29, 62)); // volume +
  faixas.push(botao("esq", H * 0.385, 62)); // volume −
  faixas.push(botao("dir", H * 0.32, 96)); // botão lateral
  faixas.push(botao("dir", H * 0.6, 58)); // controle da câmera

  return faixas;
}

// Calculado uma vez, no carregamento do módulo — idêntico no servidor e no cliente.
const LATERAL = montarLateral();

function Lente({ className }: { className?: string }) {
  return (
    <span
      className={cn("absolute rounded-full", className)}
      style={{
        width: 92,
        height: 92,
        background:
          "radial-gradient(circle at 50% 50%, #0b0b12 0 30%, #1d1d2a 31% 44%, #06060a 45% 58%, #2a2a2a 59% 66%, #9a9a9a 67% 70%, #3b3b3b 71% 100%)",
        boxShadow: "0 3px 8px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.35)",
      }}
    >
      <span className="absolute left-[34%] top-[30%] size-3 rounded-full bg-white/30 blur-[1px]" />
    </span>
  );
}

function Traseira() {
  const { R, D } = DEVICE;
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        borderRadius: R,
        transform: `translateZ(${-D / 2}px) rotateY(180deg)`,
        backfaceVisibility: "hidden",
        background: "linear-gradient(150deg, #f59150 0%, #e2621f 38%, #c9531a 72%, #a8420f 100%)",
        boxShadow: "inset 0 0 0 3px rgba(255,190,140,0.35), inset 0 0 40px rgba(80,20,0,0.35)",
      }}
    >
      {/* Platô de câmeras de ponta a ponta, marca do 17 Pro. */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: DEVICE.H * 0.27,
          background: "linear-gradient(160deg, #f7a068 0%, #e96b27 55%, #d45b1c 100%)",
          borderBottomLeftRadius: 46,
          borderBottomRightRadius: 46,
          boxShadow: "0 10px 22px rgba(90,25,0,0.4), inset 0 -2px 0 rgba(255,210,170,0.35)",
        }}
      >
        <Lente className="left-[26px] top-[22px]" />
        <Lente className="left-[26px] top-[122px]" />
        <Lente className="left-[124px] top-[72px]" />
        {/* flash, LiDAR e microfone */}
        <span
          className="absolute right-[40px] top-[40px] size-[34px] rounded-full"
          style={{ background: "radial-gradient(circle, #fff7e6 0 35%, #e8d9b8 36% 60%, #8a7a60 61% 100%)" }}
        />
        <span className="absolute right-[44px] top-[124px] size-[26px] rounded-full bg-[#0b0b0b] shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]" />
        <span className="absolute right-[100px] top-[60px] size-[7px] rounded-full bg-[#5a2208]" />
      </div>
      {/* Reflexo metálico diagonal. */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.16)_45%,transparent_60%)]" />
    </div>
  );
}

interface IPhoneProps {
  /** Conteúdo da tela, desenhado na base fixa de 430 × 932. */
  screen: React.ReactNode;
  /** Camadas da "vista explodida", sobre a tela, fora do recorte. */
  explode?: React.ReactNode;
  className?: string;
}

export function IPhone17ProMax({ screen, explode, className }: IPhoneProps) {
  const { W, H, R, D, INSET } = DEVICE;

  return (
    <div
      className={cn("relative", className)}
      style={{ width: W, height: H, transformStyle: "preserve-3d" }}
      data-device
    >
      {LATERAL.map((f, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute"
          style={{
            left: f.left,
            top: f.top,
            width: f.width,
            height: f.height,
            transform: `rotateZ(${f.phi}deg) rotateX(90deg)`,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.38), transparent 28%, rgba(255,255,255,0.14) 50%, transparent 72%, rgba(0,0,0,0.38)), ${f.cor}`,
          }}
        />
      ))}

      <Traseira />

      {/* Frente: anel do chassi, vidro, tela e Dynamic Island. */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: R,
          transform: `translateZ(${D / 2}px)`,
          backfaceVisibility: "hidden",
          background: "linear-gradient(150deg, #ffb27a, #e2621f 35%, #a8420f 70%, #f08a45)",
        }}
      >
        <div
          className="absolute inset-[3.5px] bg-[#030303]"
          style={{ borderRadius: R - 3.5, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        />
        <div
          className="absolute overflow-hidden bg-[#050505]"
          style={{ left: INSET, top: INSET, width: SCREEN.W, height: SCREEN.H, borderRadius: SCREEN.R }}
          data-screen-content
        >
          <div style={{ width: CANVAS.W, height: CANVAS.H, transform: `scale(${CANVAS_SCALE})`, transformOrigin: "0 0" }}>
            {screen}
          </div>
        </div>
        {/* Reflexo do vidro: sutil, anda com a rotação (ver timeline). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute overflow-hidden"
          style={{ left: INSET, top: INSET, width: SCREEN.W, height: SCREEN.H, borderRadius: SCREEN.R }}
        >
          <div
            data-glare
            className="absolute -inset-y-10 left-[-60%] w-[80%] bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.09)_45%,rgba(255,255,255,0.02)_60%,transparent)]"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={{ top: INSET + 9, width: 108, height: 31 }}
        >
          <span className="absolute right-[18px] top-1/2 size-[9px] -translate-y-1/2 rounded-full bg-[#0d1426] shadow-[inset_0_0_2px_rgba(120,160,255,0.5)]" />
        </div>
      </div>

      {explode ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: INSET,
            top: INSET,
            width: SCREEN.W,
            height: SCREEN.H,
            transform: `translateZ(${D / 2 + 1}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              width: CANVAS.W,
              height: CANVAS.H,
              transform: `scale(${CANVAS_SCALE})`,
              transformOrigin: "0 0",
              transformStyle: "preserve-3d",
            }}
          >
            {explode}
          </div>
        </div>
      ) : null}
    </div>
  );
}
