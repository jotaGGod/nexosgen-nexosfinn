import {
  ArrowLeftRight,
  LayoutDashboard,
  PieChart,
  Settings,
  Target,
  Wallet,
  LayoutGrid,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Itens da navegação lateral, na ordem do layout de referência. */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRight },
  { href: "/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/orcamentos", label: "Orçamentos", icon: PieChart },
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];
