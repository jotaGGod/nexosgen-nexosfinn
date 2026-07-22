import type { Metadata } from "next";

import { ReportsView } from "@/components/reports/reports-view";

export const metadata: Metadata = { title: "Relatórios" };

export default function ReportsPage() {
  return <ReportsView />;
}
