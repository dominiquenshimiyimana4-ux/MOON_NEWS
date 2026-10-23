import type { NewsletterSubscriber, User } from "@/lib/types";

export const users: User[] = [
  {
    id: "u1",
    name: "Keza Mukamana",
    email: "keza@moonnews.rw",
    role: "admin",
    avatar: "https://i.pravatar.cc/80?img=47",
    createdAt: new Date("2024-01-12").toISOString(),
  },
  {
    id: "u2",
    name: "Olivier Habimana",
    email: "olivier@moonnews.rw",
    role: "journalist",
    avatar: "https://i.pravatar.cc/80?img=12",
    createdAt: new Date("2024-03-02").toISOString(),
  },
  {
    id: "u3",
    name: "Aline Uwase",
    email: "aline@moonnews.rw",
    role: "editor",
    avatar: "https://i.pravatar.cc/80?img=32",
    createdAt: new Date("2024-04-18").toISOString(),
  },
  {
    id: "u4",
    name: "Jean Bosco Nsengimana",
    email: "bosco@moonnews.rw",
    role: "journalist",
    avatar: "https://i.pravatar.cc/80?img=68",
    createdAt: new Date("2024-06-01").toISOString(),
  },
  {
    id: "u5",
    name: "Claudine R.",
    email: "claudine@example.com",
    role: "reader",
    createdAt: new Date("2025-02-11").toISOString(),
  },
  {
    id: "u-adv1",
    name: "Alice Uwase",
    email: "ads@bk.rw",
    role: "advertiser",
    avatar: "https://i.pravatar.cc/80?img=45",
    createdAt: new Date("2025-08-20").toISOString(),
  },
];

export const subscribers: NewsletterSubscriber[] = [
  { id: "s1", email: "reader1@example.com", createdAt: new Date("2025-05-01").toISOString() },
  { id: "s2", email: "reader2@example.com", createdAt: new Date("2025-06-14").toISOString() },
  { id: "s3", email: "reader3@example.com", createdAt: new Date("2025-07-22").toISOString() },
];

/** 14-day series for admin charts. */
export const dailyViews = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (13 - i));
  return {
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: 3200 + Math.round(1800 * Math.abs(Math.sin(i / 1.7))) + i * 60,
    articles: 1 + ((i * 3) % 6),
  };
});

export const userGrowth = Array.from({ length: 6 }, (_, i) => {
  const labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return { month: labels[i], users: 420 + i * 130 + (i % 2) * 40 };
});
