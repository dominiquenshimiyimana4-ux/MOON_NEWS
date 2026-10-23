import { HeroNews } from "@/components/HeroNews";
import { LatestNewsSection } from "@/components/LatestNewsSection";
import { TrendingNews } from "@/components/TrendingNews";
import { PopularStories } from "@/components/PopularStories";
import { CategorySection } from "@/components/CategorySection";
import { VideoSection } from "@/components/VideoSection";
import { PhotoSection } from "@/components/PhotoSection";
import { Newsletter } from "@/components/Newsletter";
import { newsService } from "@/lib/services/newsService";

export default async function HomePage() {
  const [featured, trending, popular, business, sports, technology] = await Promise.all([
    newsService.getFeatured(5),
    newsService.getTrending(8),
    newsService.getTrending(5),
    newsService.getByCategory("business", { pageSize: 4 }),
    newsService.getByCategory("sports", { pageSize: 4 }),
    newsService.getByCategory("technology", { pageSize: 4 }),
  ]);

  const [main, ...secondary] = featured;

  return (
    <div className="container-page space-y-14 py-6 sm:py-8">
      {main && <HeroNews main={main} secondary={secondary} />}

      {/* Latest + sidebar */}
      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LatestNewsSection />
        </div>
        <div className="space-y-6">
          <PopularStories articles={popular} />
          <div className="rounded-xl border border-border p-4">
            <VideoSection limit={1} showHeading={false} />
          </div>
        </div>
      </section>

      <TrendingNews articles={trending} />

      <CategorySection category="business" articles={business.items} />
      <CategorySection category="sports" articles={sports.items} />

      <VideoSection limit={3} />

      <CategorySection category="technology" articles={technology.items} />

      <PhotoSection limit={4} />

      <Newsletter />
    </div>
  );
}
