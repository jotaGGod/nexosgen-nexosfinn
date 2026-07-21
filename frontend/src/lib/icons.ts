import {
  Briefcase,
  Car,
  CreditCard,
  Ellipsis,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  Nfc,
  PartyPopper,
  PiggyBank,
  Plane,
  Plus,
  ShoppingCart,
  Shield,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Ícones disponíveis para categorias, contas e metas.
 *
 * O backend guarda apenas o identificador em texto; o mapeamento para o
 * componente acontece aqui, com um padrão seguro para identificadores
 * desconhecidos (por exemplo, vindos de uma versão futura).
 */
export const iconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  car: Car,
  "credit-card": CreditCard,
  ellipsis: Ellipsis,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  home: Home,
  landmark: Landmark,
  laptop: Laptop,
  nfc: Nfc,
  "party-popper": PartyPopper,
  "piggy-bank": PiggyBank,
  plane: Plane,
  "shopping-cart": ShoppingCart,
  shield: Shield,
  sparkles: Sparkles,
  tag: Tag,
  target: Target,
  "trending-up": TrendingUp,
  utensils: Utensils,
  wallet: Wallet,
};

export function resolveIcon(name: string | undefined): LucideIcon {
  if (!name) return Tag;
  return iconMap[name] ?? Tag;
}

/** Opções oferecidas nos formulários de categoria e conta. */
export const iconOptions = Object.keys(iconMap);

/** Paleta sugerida, alinhada às cores do layout. */
export const colorOptions = [
  "#7C3AED",
  "#6366F1",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#14B8A6",
  "#38BDF8",
  "#EF4444",
  "#94A3B8",
];

export const AddIcon = Plus;

/** Rótulos dos tipos de conta. */
export const accountTypeLabels: Record<string, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  credit_card: "Cartão de crédito",
  cash: "Dinheiro",
  investment: "Investimento",
};

/** Ícone padrão de cada tipo de conta. */
export const accountTypeIcons: Record<string, string> = {
  checking: "landmark",
  savings: "piggy-bank",
  credit_card: "credit-card",
  cash: "wallet",
  investment: "trending-up",
};
