import type { Metadata } from "next";
import { LatestNewsSection } from "@/components/LatestNewsSection";
import { PopularStories } from "@/components/PopularStories";
import { TrendingNews } from "@/components/TrendingNews";
import { newsService } from "@/lib/services/newsService";

export const metadata: Metadata = {
  title: "Latest News",
  description: "The latest news from Moon News, updated continuously.",
};

export default async function LatestPage() {
  const [popular, trending] = await Promise.all([
    newsService.getTrending(5),
    newsService.getTrending(8),
  ]);

  return (
    <div className="container-page py-8">
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">
          Latest News
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
          Amakuru agezweho — updated continuously by the Moon News newsroom.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LatestNewsSection showHeading={false} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PopularStories articles={popular} />
        </aside>
      </div>

      <div className="mt-14">
        <TrendingNews articles={trending} />
      </div>
    </div>
  );
}
