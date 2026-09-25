import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 ease-out-expo active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-0 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Ação principal: eleva 2px e ganha um halo curto da cor de marca no
        // ponteiro — exatamente o "leve lift" que o design system pede.
        default:
          "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift-primary)]",
        gradient:
          "bg-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:shadow-[0_0_48px_hsl(var(--primary)/0.28),var(--shadow-lift-primary)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:bg-destructive/95",
        outline:
          "border border-border bg-card/70 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Pílula clara, a ação de maior contraste num painel escuro.
        contrast: "bg-foreground text-background hover:-translate-y-0.5 hover:bg-foreground/90",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-active underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-10 px-4",
        lg: "h-12 px-7",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
