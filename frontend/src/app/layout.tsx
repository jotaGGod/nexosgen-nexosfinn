import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "@/lib/query-provider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinApp — Gestão financeira pessoal",
    template: "%s · FinApp",
  },
  description: "Controle suas receitas, despesas, metas e orçamentos em um só lugar.",
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
  themeColor: "#070B17",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" translate="no" className={`dark notranslate ${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans">
        <QueryProvider>
          {children}
          <Toaster position="top-right" theme="dark" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
