import type { LiveEvent } from "@/lib/types";
import { img } from "./articles";

const mins = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const liveEvents: LiveEvent[] = [
  {
    id: "l1",
    slug: "national-independence-day",
    title: {
      rw: "Umunsi w’Ubwigenge — Amakuru agezweho",
      en: "National Day — Live Updates",
    },
    summary: {
      rw: "Kurikira uko ibirori by’umunsi w’ubwigenge bigenda bigera ku mwanya.",
      en: "Follow live coverage of the national day celebrations from Kigali.",
    },
    cover: img("moonlive-1", 1200, 700),
    streamUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    updates: [
      {
        id: "u1",
        time: mins(6),
        type: "text",
        title: { rw: "Ibirori byatangiye", en: "Ceremonies begin" },
        body: {
          rw: "Ibirori byatangiye i Kigali hagaragazwa imbyino n’imiziki y’umuco.",
          en: "The official ceremony has begun in Kigali with cultural performances.",
        },
      },
      {
        id: "u2",
        time: mins(28),
        type: "photo",
        title: { rw: "Ifoto: Abitabiriye", en: "Photo: Attendees arrive" },
        body: {
          rw: "Abayobozi n’abaturage bitabiriye ibirori mu bwinshi.",
          en: "Leaders and residents arrived in large numbers for the celebrations.",
        },
        media: img("moonlive-1b", 1000, 600),
      },
      {
        id: "u3",
        time: mins(55),
        type: "text",
        title: { rw: "Ijambo ry’umukuru w’igihugu", en: "Head of state address" },
        body: {
          rw: "Ijambo ryibanze ku iterambere n’ubumwe bw’abanyarwanda.",
          en: "The address focused on national progress and unity.",
        },
      },
      {
        id: "u4",
        time: mins(120),
        type: "text",
        title: { rw: "Imyiteguro y’igitaramo", en: "Evening concert preparations" },
        body: {
          rw: "Igitaramo kizabera ku rubuga rw’ibirori nimugoroba.",
          en: "A public concert is scheduled at the venue this evening.",
        },
      },
    ],
  },
];
