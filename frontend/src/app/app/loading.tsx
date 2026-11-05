import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Carregando página" className="space-y-6">
      <span className="sr-only">Carregando página</span>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-64 max-w-full" />
      <div className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-36 rounded-3xl" />)}
      </div>
    </div>
  );
}
