"use client";

import { useEffect, useState } from "react";
import type { PhotoGallery } from "@/lib/types";
import { contentService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { GalleryCard, GalleryViewer } from "./PhotoGalleries";
import { SectionHeading } from "./SectionHeading";

export function PhotoSection({ limit }: { limit?: number }) {
  const { t } = useLanguage();
  const [galleries, setGalleries] = useState<PhotoGallery[]>([]);
  const [active, setActive] = useState<PhotoGallery | null>(null);

  useEffect(() => {
    contentService.galleries().then((g) => setGalleries(limit ? g.slice(0, limit) : g));
  }, [limit]);

  if (galleries.length === 0) return null;

  return (
    <section>
      <SectionHeading title={t("section.photos")} href="/photos" accent="#db2777" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {galleries.map((g) => (
          <GalleryCard key={g.id} gallery={g} onOpen={setActive} />
        ))}
      </div>
      <GalleryViewer gallery={active} onClose={() => setActive(null)} />
    </section>
  );
}

export default PhotoSection;
