import { cn } from "@/lib/utils";

/** Placeholder de carregamento. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} {...props} />;
}

export { Skeleton };
