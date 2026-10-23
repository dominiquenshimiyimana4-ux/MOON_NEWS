import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="skeleton aspect-[16/10] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-4 w-20 rounded-full" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={cn("grid grid-cols-1 gap-5", colClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="skeleton aspect-[16/10] rounded-2xl lg:col-span-2 lg:aspect-[16/9]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="space-y-3">
        <div className="skeleton h-9 w-full rounded" />
        <div className="skeleton h-9 w-2/3 rounded" />
      </div>
      <div className="skeleton h-5 w-1/2 rounded" />
      <div className="skeleton aspect-[16/9] w-full rounded-xl" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-4 w-full rounded" />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-20 w-28 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
