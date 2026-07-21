"use client";

import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
import { ProfileTab } from "@/components/settings/profile-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Configurações com duas abas.
 *
 * A aba inicial pode vir por query string (?tab=integracoes), o que permite
 * linkar direto para Integrações a partir do menu do usuário.
 */
export function SettingsView() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "integracoes" ? "integracoes" : "perfil";

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" subtitle="Gerencie sua conta e integrações" />

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="integracoes">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
