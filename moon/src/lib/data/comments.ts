import type { Comment } from "@/lib/types";

const hrs = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

/** Demo comments keyed by article slug. Backend will replace this via API. */
export const comments: Comment[] = [
  {
    id: "c1",
    articleId: "n1",
    authorName: "Patrick N.",
    authorAvatar: "https://i.pravatar.cc/80?img=15",
    content:
      "Great to see investment in young developers. Hope the training reaches all provinces, not just Kigali.",
    createdAt: hrs(2),
    likes: 14,
    parentId: null,
  },
  {
    id: "c2",
    articleId: "n1",
    authorName: "Sandrine U.",
    authorAvatar: "https://i.pravatar.cc/80?img=25",
    content:
      "This is exactly the kind of programme we need. Will there be follow-up funding after training?",
    createdAt: hrs(1),
    likes: 6,
    parentId: "c1",
  },
  {
    id: "c3",
    articleId: "n3",
    authorName: "Emmanuel K.",
    authorAvatar: "https://i.pravatar.cc/80?img=33",
    content: "What a match! The title race is going down to the wire this season.",
    createdAt: hrs(3),
    likes: 21,
    parentId: null,
  },
  {
    id: "c4",
    articleId: "n2",
    authorName: "Grace M.",
    authorAvatar: "https://i.pravatar.cc/80?img=44",
    content: "Interesting data on the markets. Would love a deeper analysis on inflation.",
    createdAt: hrs(5),
    likes: 3,
    parentId: null,
  },
];
