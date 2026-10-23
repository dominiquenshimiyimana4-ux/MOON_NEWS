import type { PhotoGallery } from "@/lib/types";
import { img } from "./articles";

export const galleries: PhotoGallery[] = [
  {
    id: "g1",
    slug: "kigali-skyline",
    title: { rw: "Umujyi wa Kigali mu mafoto", en: "Kigali skyline in photos" },
    cover: img("moongal-1", 1200, 800),
    category: "rwanda",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    photos: [
      { url: img("moongal-1a", 1200, 800), caption: { rw: "Kigali mu gitondo", en: "Kigali at dawn" } },
      { url: img("moongal-1b", 1200, 800), caption: { rw: "Umuhanda mukuru", en: "The main boulevard" } },
      { url: img("moongal-1c", 1200, 800), caption: { rw: "Inyubako nshya", en: "New developments" } },
      { url: img("moongal-1d", 1200, 800), caption: { rw: "Kigali nijoro", en: "Kigali at night" } },
    ],
  },
  {
    id: "g2",
    slug: "festival-moments",
    title: {
      rw: "Amafoto y’iserukiramuco ry’umuziki",
      en: "Music festival moments",
    },
    cover: img("moongal-2", 1200, 800),
    category: "entertainment",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    photos: [
      { url: img("moongal-2a", 1200, 800), caption: { rw: "Ku rubyiniro", en: "On stage" } },
      { url: img("moongal-2b", 1200, 800), caption: { rw: "Abafana", en: "The crowd" } },
      { url: img("moongal-2c", 1200, 800), caption: { rw: "Umuhanzi", en: "A headline act" } },
    ],
  },
  {
    id: "g3",
    slug: "match-day",
    title: { rw: "Umunsi w’umukino mu mafoto", en: "Match day in photos" },
    cover: img("moongal-3", 1200, 800),
    category: "sports",
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    photos: [
      { url: img("moongal-3a", 1200, 800), caption: { rw: "Mbere y’umukino", en: "Before kick-off" } },
      { url: img("moongal-3b", 1200, 800), caption: { rw: "Igitego", en: "The goal" } },
      { url: img("moongal-3c", 1200, 800), caption: { rw: "Ibyishimo", en: "Celebration" } },
    ],
  },
  {
    id: "g4",
    slug: "market-life",
    title: { rw: "Ubuzima bw’isoko", en: "Market life" },
    cover: img("moongal-4", 1200, 800),
    category: "business",
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    photos: [
      { url: img("moongal-4a", 1200, 800), caption: { rw: "Abacuruzi", en: "Traders at work" } },
      { url: img("moongal-4b", 1200, 800), caption: { rw: "Ibicuruzwa", en: "Fresh produce" } },
    ],
  },
];
