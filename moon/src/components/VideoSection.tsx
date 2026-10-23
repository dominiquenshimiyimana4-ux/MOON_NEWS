"use client";

import { useEffect, useState } from "react";
import type { VideoItem } from "@/lib/types";
import { contentService } from "@/lib/services/newsService";
import { VideoCard } from "./VideoCard";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { SectionHeading } from "./SectionHeading";

export function VideoSection({ limit, showHeading = true }: { limit?: number; showHeading?: boolean }) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [active, setActive] = useState<VideoItem | null>(null);

  useEffect(() => {
    contentService.videos().then((v) => setVideos(limit ? v.slice(0, limit) : v));
  }, [limit]);

  if (videos.length === 0) return null;

  return (
    <section>
      {showHeading && (
        <SectionHeading title="Moon News TV" href="/video" accent="#e3a637" />
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onPlay={setActive} />
        ))}
      </div>
      <VideoPlayerModal video={active} onClose={() => setActive(null)} />
    </section>
  );
}

export default VideoSection;
