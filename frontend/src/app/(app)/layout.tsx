import { Sidebar } from "@/components/layout/sidebar";

/**
 * Casca das telas autenticadas: sidebar escura fixa à esquerda e área de
 * conteúdo clara à direita, como no layout de referência.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
