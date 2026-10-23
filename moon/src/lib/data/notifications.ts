import type { Notification } from "@/lib/types";

const mins = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const notifications: Notification[] = [
  {
    id: "nt1",
    type: "breaking",
    title: { rw: "Amakuru yihutirwa", en: "Breaking News" },
    body: {
      rw: "U Rwanda rwatangije gahunda nshya y’ikoranabuhanga.",
      en: "Rwanda launches a new digital innovation initiative.",
    },
    createdAt: mins(4),
    read: false,
    href: "/news/technology/rwanda-launches-digital-innovation-initiative",
  },
  {
    id: "nt2",
    type: "sports",
    title: { rw: "Imikino", en: "Sports update" },
    body: {
      rw: "Irushanwa rya shampiyona y’umupira w’amaguru rirarushaho gukataza.",
      en: "The national football league title race heats up.",
    },
    createdAt: mins(40),
    read: false,
    href: "/news/sports/national-football-league-title-race",
  },
  {
    id: "nt3",
    type: "article",
    title: { rw: "Inkuru nshya", en: "New article published" },
    body: {
      rw: "Ibigo bito by’ikoranabuhanga i Kigali byabonye inkunga.",
      en: "Kigali tech startups attract new funding.",
    },
    createdAt: mins(180),
    read: true,
    href: "/news/technology/kigali-tech-startups-attract-funding",
  },
  {
    id: "nt4",
    type: "technology",
    title: { rw: "Ikoranabuhanga", en: "Technology update" },
    body: {
      rw: "Amashuri yongera amasomo y’ikoranabuhanga mu gihugu hose.",
      en: "Schools expand the coding curriculum nationwide.",
    },
    createdAt: mins(600),
    read: true,
    href: "/news/education/schools-expand-coding-curriculum",
  },
];
