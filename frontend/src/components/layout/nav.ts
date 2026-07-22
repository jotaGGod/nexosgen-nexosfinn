import {
  ArrowLeftRight,
  BarChart3,
  Home,
  LayoutGrid,
  PieChart,
  Settings,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Destinos da barra inferior.
 *
 * São quatro porque, somados ao botão "Mais", ocupam cinco alvos de toque — o
 * limite confortável na largura de um celular. Estes quatro cobrem o uso
 * diário; o restante vive na gaveta.
 */
export const primaryNavItems: NavItem[] = [
  { href: "/app/dashboard", label: "Início", icon: Home },
  { href: "/app/transacoes", label: "Transações", icon: ArrowLeftRight },
  { href: "/app/relatorios", label: "Análises", icon: BarChart3 },
  { href: "/app/metas", label: "Metas", icon: Target },
];

/** Destinos de uso ocasional, abertos pelo botão "Mais". */
export const secondaryNavItems: NavItem[] = [
  { href: "/app/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/app/orcamentos", label: "Orçamentos", icon: PieChart },
  { href: "/app/contas", label: "Contas", icon: Wallet },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings },
];

export const navItems: NavItem[] = [...primaryNavItems, ...secondaryNavItems];
