import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchView } from "@/components/SearchView";
import { ListSkeleton } from "@/components/LoadingSkeleton";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Moon News — trusted Rwanda and international news.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-8">
          <ListSkeleton count={5} />
        </div>
      }
    >
      <SearchView />
    </Suspense>
  );
}
