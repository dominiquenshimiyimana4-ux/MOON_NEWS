import type { Author } from "@/lib/types";

export const authors: Author[] = [
  {
    id: "a1",
    slug: "keza-mukamana",
    name: "Keza Mukamana",
    position: "Editor-in-Chief",
    bio: "Keza leads the Moon News newsroom. She has covered Rwandan politics and regional affairs for over a decade and is committed to accurate, timely journalism.",
    avatar: "https://i.pravatar.cc/200?img=47",
    social: {
      twitter: "https://x.com/moonnews",
      linkedin: "https://linkedin.com",
      email: "keza@moonnews.rw",
    },
  },
  {
    id: "a2",
    slug: "olivier-habimana",
    name: "Olivier Habimana",
    position: "Technology Reporter",
    bio: "Olivier writes about startups, digital policy and innovation across East Africa. He believes technology reporting should be practical and people-first.",
    avatar: "https://i.pravatar.cc/200?img=12",
    social: { twitter: "https://x.com/moonnews", email: "olivier@moonnews.rw" },
  },
  {
    id: "a3",
    slug: "aline-uwase",
    name: "Aline Uwase",
    position: "Business Correspondent",
    bio: "Aline covers markets, banking and trade. She focuses on how economic policy shapes everyday life for Rwandans and the wider region.",
    avatar: "https://i.pravatar.cc/200?img=32",
    social: { linkedin: "https://linkedin.com", email: "aline@moonnews.rw" },
  },
  {
    id: "a4",
    slug: "jean-bosco-nsengimana",
    name: "Jean Bosco Nsengimana",
    position: "Sports Editor",
    bio: "Jean Bosco reports on football, basketball and athletics, from local leagues to continental competition.",
    avatar: "https://i.pravatar.cc/200?img=68",
    social: { twitter: "https://x.com/moonnews", email: "bosco@moonnews.rw" },
  },
  {
    id: "a5",
    slug: "divine-ingabire",
    name: "Divine Ingabire",
    position: "Health & Environment Reporter",
    bio: "Divine reports on public health, climate and conservation, translating complex science into clear stories for a broad audience.",
    avatar: "https://i.pravatar.cc/200?img=45",
    social: { email: "divine@moonnews.rw" },
  },
  {
    id: "a6",
    slug: "eric-ndayisaba",
    name: "Eric Ndayisaba",
    position: "International Correspondent",
    bio: "Eric covers diplomacy, global affairs and the African diaspora, connecting international developments back to readers at home.",
    avatar: "https://i.pravatar.cc/200?img=59",
    social: { twitter: "https://x.com/moonnews", linkedin: "https://linkedin.com" },
  },
];

export const authorMap: Record<string, Author> = authors.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Author>
);
