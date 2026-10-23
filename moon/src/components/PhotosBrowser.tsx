"use client";

import { useEffect, useState } from "react";
import type { PhotoGallery } from "@/lib/types";
import { contentService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { GalleryCard, GalleryViewer } from "./PhotoGalleries";

export function PhotosBrowser() {
  const { locale } = useLanguage();
  const [galleries, setGalleries] = useState<PhotoGallery[]>([]);
  const [active, setActive] = useState<PhotoGallery | null>(null);

  useEffect(() => {
    contentService.galleries().then(setGalleries);
  }, []);

  return (
    <div className="container-page py-8">
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">
          {locale === "rw" ? "Inkuru mu mafoto" : "Photo Stories"}
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
          {locale === "rw"
            ? "Amafoto y'inkuru z'ingenzi mu Rwanda no mu mahanga."
            : "Visual coverage of the stories that matter, in Rwanda and beyond."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((g) => (
          <GalleryCard key={g.id} gallery={g} onOpen={setActive} />
        ))}
      </div>

      <GalleryViewer gallery={active} onClose={() => setActive(null)} />
    </div>
  );
}

export default PhotosBrowser;
