import type { Metadata } from "next";

import { BudgetsView } from "@/components/budgets/budgets-view";

export const metadata: Metadata = { title: "Orçamentos" };

export default function BudgetsPage() {
  return <BudgetsView />;
}
