import type { VideoItem } from "@/lib/types";
import { img } from "./articles";

export const videos: VideoItem[] = [
  {
    id: "v1",
    slug: "inside-kigali-innovation-hub",
    title: {
      rw: "Imbere muri hub y’ikoranabuhanga i Kigali",
      en: "Inside Kigali's innovation hub",
    },
    description: {
      rw: "Twasuye aho urubyiruko rukorera ibikorwa by’ikoranabuhanga i Kigali.",
      en: "We visit where young builders are shipping Rwanda's next generation of software.",
    },
    category: "technology",
    thumbnail: img("moonvid-1", 800, 450),
    duration: "04:12",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    views: 24300,
  },
  {
    id: "v2",
    slug: "match-highlights-weekend",
    title: {
      rw: "Ibikomeye by’imikino y’imperuka",
      en: "Weekend match highlights",
    },
    description: {
      rw: "Reba ibikomeye by’imikino yose yabaye mu mpera z’icyumweru.",
      en: "Watch the goals and key moments from this weekend's fixtures.",
    },
    category: "sports",
    thumbnail: img("moonvid-2", 800, 450),
    duration: "06:48",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    views: 41200,
  },
  {
    id: "v3",
    slug: "market-report-this-week",
    title: {
      rw: "Raporo y’isoko ry’iki cyumweru",
      en: "This week's market report",
    },
    description: {
      rw: "Isesengura ry’ibiciro n’ubucuruzi mu cyumweru gishize.",
      en: "A quick breakdown of prices and trade over the past week.",
    },
    category: "business",
    thumbnail: img("moonvid-3", 800, 450),
    duration: "03:30",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    views: 9800,
  },
  {
    id: "v4",
    slug: "conservation-in-the-parks",
    title: {
      rw: "Kubungabunga ibidukikije muri parike",
      en: "Conservation work in the parks",
    },
    description: {
      rw: "Uko abarinzi b’ibidukikije bakora muri parike z’igihugu.",
      en: "How rangers are protecting wildlife in Rwanda's national parks.",
    },
    category: "environment",
    thumbnail: img("moonvid-4", 800, 450),
    duration: "05:22",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    views: 15600,
  },
  {
    id: "v5",
    slug: "music-festival-live-set",
    title: {
      rw: "Umuziki w’iserukiramuco (live)",
      en: "Festival live set",
    },
    description: {
      rw: "Reba amashusho y’igitaramo cyabereye i Kigali.",
      en: "Highlights from a live performance at the Kigali festival.",
    },
    category: "entertainment",
    thumbnail: img("moonvid-5", 800, 450),
    duration: "08:05",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    views: 33100,
  },
  {
    id: "v6",
    slug: "health-centre-tour",
    title: {
      rw: "Gusura ivuriro rishya",
      en: "Tour of a new health centre",
    },
    description: {
      rw: "Tugendereye ivuriro rishya ryafunguwe mu cyaro.",
      en: "We tour a newly opened rural health centre.",
    },
    category: "health",
    thumbnail: img("moonvid-6", 800, 450),
    duration: "04:40",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    publishedAt: new Date(Date.now() - 518400000).toISOString(),
    views: 7200,
  },
];
