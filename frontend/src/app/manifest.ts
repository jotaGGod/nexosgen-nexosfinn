import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "NexosFinn",
    short_name: "NexosFinn",
    description: "Suas finanças sob controle.",
    /*
     * O app instalado abre direto no aplicativo, e não na página de vendas.
     * Sem sessão, o casco de /app manda para o login; com sessão, cai no início.
     */
    start_url: "/app/dashboard?source=homescreen",
    scope: "/",
    /*
     * `standalone`, e não `fullscreen`.
     *
     * O iOS não implementa `fullscreen`; ao encontrar um modo que não conhece
     * ele cai para o comportamento padrão, e o app instalado abre encaixotado.
     * `standalone` é o modo que o iOS realmente entende — quem faz o conteúdo
     * chegar às bordas é o par `viewport-fit=cover` +
     * `apple-mobile-web-app-status-bar-style: black-translucent`.
     */
    display: "standalone",
    display_override: ["standalone"],
    prefer_related_applications: false,
    orientation: "portrait-primary",
    /* Cor da tela de abertura, antes do primeiro quadro da aplicação. */
    background_color: "#050505",
    /*
     * `theme_color` fica de fora de propósito.
     *
     * Quando o manifest declara uma cor de tema, o iOS pinta a faixa da barra
     * de status com ela e passa a ignorar o `black-translucent` — o conteúdo
     * deixa de correr por baixo do relógio e da bateria, e sobra a faixa sólida
     * no topo (com a contraparte na base, no indicador de início). Sem esta
     * chave, o `black-translucent` volta a valer e a tela fica contínua.
     */
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
