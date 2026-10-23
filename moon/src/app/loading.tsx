import { HeroSkeleton, GridSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="container-page space-y-10 py-8">
      <HeroSkeleton />
      <GridSkeleton count={6} />
    </div>
  );
}
