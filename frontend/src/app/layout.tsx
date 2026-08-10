import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { DomGuard } from "@/components/common/dom-guard";
import { ThemeProvider } from "@/components/common/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexosfinn.vercel.app"),
  applicationName: "NexosFinn",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "NexosFinn",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  title: {
    default: "NexosFinn — Suas finanças sob controle",
    template: "%s · NexosFinn",
  },
  description:
    "Acompanhe receitas e despesas, defina limites por categoria e alcance suas metas com um assistente que entende o seu dinheiro.",
  other: {
    // Impede que o Google Tradutor reescreva o conteúdo.
    //
    // A interface já é em pt-BR, então traduzir não agrega — e o tradutor
    // substitui os nós de texto no DOM por conta própria. Quando o React vai
    // reconciliar esses nós (ao inserir uma linha na lista depois de salvar,
    // por exemplo), ele não encontra mais o nó que criou e lança
    // "Failed to execute 'removeChild'", derrubando a aplicação inteira.
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInitializer = `
  try {
    var storedTheme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = storedTheme === "light" ? "light" : "dark";
    var themeColor = theme === "dark" ? ${JSON.stringify(THEME_COLORS.dark)} : ${JSON.stringify(THEME_COLORS.light)};
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.backgroundColor = themeColor;
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);

    /*
     * No app instalado, a cor de tema sai de cena.
     *
     * No navegador ela é útil: tinge a barra do Safari e do Chrome. Já no modo
     * standalone do iOS, uma cor de tema declarada faz o sistema desenhar uma
     * faixa sólida atrás do relógio e da bateria — e o conteúdo para de correr
     * por baixo dela. Removendo a marcação só nesse modo, o
     * "black-translucent" volta a valer e a tela usa a altura inteira, sem
     * perder o tingimento no navegador.
     */
    var instalado =
      window.navigator.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches;

    var metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (instalado) {
      metaThemeColor?.remove();
    } else {
      metaThemeColor?.setAttribute("content", themeColor);
    }
  } catch (_) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      translate="no"
      className={`dark notranslate ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content={THEME_COLORS.dark} />
        {/*
         * Declaradas à mão de propósito.
         *
         * O `appleWebApp` do metadata gera o título e o estilo da barra de
         * status, mas não emite esta — e sem `apple-mobile-web-app-capable` o
         * iOS abre o ícone como uma aba comum, sem tela cheia, e o
         * `black-translucent` deixa de valer. A variante sem prefixo, lida pelo
         * Android, o Next já emite sozinho.
         */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="min-h-dvh bg-background font-sans">
        {/*
         * Pintura de fundo da tela inteira, atrás de tudo.
         *
         * No PWA instalado do iOS (standalone) a página desenha de ponta a
         * ponta com `viewport-fit=cover`, mas as áreas seguras — atrás do
         * recorte no topo e do indicador de início na base — só ficam pintadas
         * se algum elemento realmente as cobrir. Quando o conteúdo é mais curto
         * que a tela, ou vive dentro de um contêiner com rolagem própria, essas
         * faixas apareciam pretas. Esta camada `fixed inset-0` cobre a viewport
         * visual inteira, inclusive as áreas seguras, e acompanha o tema — então
         * a tela fica fluida, sem faixas, no claro e no escuro.
         */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background" />
        <DomGuard />
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
