import { resolveIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 rounded-lg [&_svg]:size-4",
  md: "size-10 rounded-xl [&_svg]:size-[18px]",
  lg: "size-12 rounded-2xl [&_svg]:size-5",
};

/**
 * Ícone da categoria/conta sobre um fundo tingido com a cor cadastrada.
 *
 * O fundo usa a mesma cor com baixa opacidade, o que mantém contraste
 * suficiente para qualquer cor escolhida pelo usuário.
 */
export function IconBadge({ icon, color = "#7C3AED", size = "md", className }: IconBadgeProps) {
  const Icon = resolveIcon(icon);

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", sizeClasses[size], className)}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <Icon />
    </span>
  );
}
