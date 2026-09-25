"use client";

import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { ProfileTab } from "@/components/settings/profile-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Configurações com perfil, integrações e preferências visuais.
 *
 * A aba inicial pode vir por query string (?tab=integracoes ou
 * ?tab=preferencias), permitindo links diretos para essas seções.
 */
export function SettingsView() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab === "integracoes" || requestedTab === "preferencias" ? requestedTab : "perfil";

  return (
    // Configurações é a única tela sem dado tabular ou gráfico: é formulário
    // puro. Deixá-la ocupar os 1400px do contêiner produziria campos de texto
    // largos demais para ler e preencher; a coluna curta fica centrada sob a
    // barra superior.
    <div className="stagger mx-auto max-w-4xl space-y-6">
      <PageHeader title="Configurações" subtitle="Gerencie sua conta e integrações" />

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="integracoes">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="preferencias">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
