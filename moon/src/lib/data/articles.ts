import type { Article, CategorySlug } from "@/lib/types";

/**
 * Deterministic demo imagery. picsum.photos/seed/... always resolves, so the
 * UI never shows broken images during development. Replace with real CDN URLs
 * once the backend/media library is connected.
 */
export function img(seed: string, w = 1200, h = 800): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Builds a readable, multi-paragraph bilingual body from an article's seeds. */
function body(
  topic: { rw: string; en: string },
  lead: { rw: string; en: string }
): { rw: string; en: string } {
  const en = [
    `${lead.en}`,
    `The development marks a significant moment for ${topic.en}, and observers say its effects will be felt well beyond the immediate announcement. Officials described the move as part of a broader, long-term strategy rather than a one-off decision.`,
    `## Why it matters`,
    `Analysts note that ${topic.en} has been a recurring theme in national conversation this year. For residents, the practical question is how quickly the changes will translate into everyday benefits — from services and opportunities to costs and access.`,
    `> "Our priority is delivering results people can see and feel," a spokesperson said, adding that further details would be shared in the coming weeks.`,
    `Moon News will continue to follow this story and update readers as more information becomes available. Have a tip? Reach our newsroom securely at newsroom@moonnews.rw.`,
  ].join("\n\n");

  const rw = [
    `${lead.rw}`,
    `Ibi bibaye intambwe ikomeye ku ${topic.rw}, kandi abasesenguzi bavuga ko ingaruka zabyo zizumvikana kure y’itangazo ryatanzwe. Abayobozi basobanuye ko ari igice cya gahunda ngari y’igihe kirekire aho kuba icyemezo cy’igihe gito.`,
    `## Impamvu bifite akamaro`,
    `Abasesenguzi bagaragaza ko ${topic.rw} yabaye insanganyamatsiko igarukwaho cyane mu gihugu uyu mwaka. Ku baturage, ikibazo nyamukuru ni uburyo impinduka zizagera ku bantu mu buzima bwa buri munsi — kuva kuri serivisi n’amahirwe kugeza ku biciro n’uburyo bwo kubigeraho.`,
    `> "Icyo dushyize imbere ni ukugera ku musaruro abantu babona kandi bakumva," umuvugizi yavuze, yongeraho ko ibindi bisobanuro bizatangwa mu byumweru biri imbere.`,
    `Moon News izakomeza gukurikirana iyi nkuru kandi imenyeshe abasomyi uko amakuru mashya aboneka.`,
  ].join("\n\n");

  return { en, rw };
}

type Seed = Omit<
  Article,
  | "content"
  | "image"
  | "publishedAt"
  | "readingTime"
  | "views"
  | "shares"
  | "commentsCount"
  | "featured"
  | "breaking"
> & {
  seed: string;
  daysAgo: number;
  hoursAgo?: number;
  readingTime?: number;
  views?: number;
  featured?: boolean;
  breaking?: boolean;
  contentTopic: { rw: string; en: string };
  contentLead: { rw: string; en: string };
};

function iso(daysAgo: number, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

const seeds: Seed[] = [
  {
    id: "n1",
    slug: "rwanda-launches-digital-innovation-initiative",
    seed: "moon-digital",
    daysAgo: 0,
    hoursAgo: 2,
    title: {
      rw: "U Rwanda rwatangije gahunda nshya y’ikoranabuhanga",
      en: "Rwanda launches a new digital innovation initiative",
    },
    subtitle: {
      rw: "Gahunda igamije guteza imbere urubyiruko rukora mu ikoranabuhanga",
      en: "The programme aims to grow a youth-led technology sector",
    },
    excerpt: {
      rw: "Gahunda nshya izafasha urubyiruko kubona amahugurwa, inkunga n’ibikorwa remezo by’ikoranabuhanga mu gihugu hose.",
      en: "A new initiative will provide young people with training, funding and technology infrastructure across the country.",
    },
    contentTopic: { rw: "ikoranabuhanga mu Rwanda", en: "digital innovation in Rwanda" },
    contentLead: {
      rw: "U Rwanda rwatangije gahunda nshya y’ikoranabuhanga igamije guteza imbere urubyiruko no kongera umubare w’ibigo bikora software mu gihugu.",
      en: "Rwanda has launched a new digital innovation initiative designed to empower young people and expand the country's software industry.",
    },
    category: "technology",
    authorId: "a2",
    imageCaption: "Young developers at a Kigali innovation hub.",
    tags: ["innovation", "technology", "youth", "kigali"],
    status: "published",
    featured: true,
    breaking: true,
    views: 12400,
    source: "Moon News",
  },
  {
    id: "n2",
    slug: "kigali-markets-post-strong-quarter",
    seed: "moon-markets",
    daysAgo: 1,
    title: {
      rw: "Isoko ry’imari i Kigali ryagaragaje iterambere rikomeye",
      en: "Kigali financial markets post a strong quarter",
    },
    excerpt: {
      rw: "Ibigo by’imari n’ishoramari byagaragaje inyongera, biterwa n’ubucuruzi n’ishoramari rishya.",
      en: "Financial institutions and investors reported gains, driven by trade and fresh investment.",
    },
    contentTopic: { rw: "ubukungu bw’u Rwanda", en: "Rwanda's economy" },
    contentLead: {
      rw: "Isoko ry’imari i Kigali ryasoze igihembwe ku rwego rwiza, biterwa n’ishoramari rishya n’ubucuruzi mpuzamahanga.",
      en: "Kigali's financial markets closed the quarter on a strong footing, buoyed by new investment and cross-border trade.",
    },
    category: "business",
    authorId: "a3",
    tags: ["economy", "markets", "investment"],
    status: "published",
    featured: true,
    views: 8300,
    source: "Moon News",
  },
  {
    id: "n3",
    slug: "national-football-league-title-race",
    seed: "moon-football",
    daysAgo: 0,
    hoursAgo: 5,
    title: {
      rw: "Irushanwa rya shampiyona y’umupira w’amaguru rirarushaho gukataza",
      en: "National football league title race heats up",
    },
    excerpt: {
      rw: "Amakipe abiri ararwanira igikombe nyuma y’imikino iheruka y’amatsinda.",
      en: "Two clubs are battling for the title after a dramatic round of fixtures.",
    },
    contentTopic: { rw: "shampiyona y’umupira w’amaguru", en: "the national football league" },
    contentLead: {
      rw: "Irushanwa rya shampiyona y’umupira w’amaguru mu Rwanda rirarushaho gukataza nyuma y’imikino iheruka.",
      en: "The national football league title race has intensified after a dramatic round of results.",
    },
    category: "sports",
    authorId: "a4",
    tags: ["football", "league", "sports"],
    status: "published",
    featured: true,
    breaking: true,
    views: 15600,
    source: "Moon News",
  },
  {
    id: "n4",
    slug: "new-health-centers-open-in-rural-districts",
    seed: "moon-health",
    daysAgo: 2,
    title: {
      rw: "Ivuriro rishya ryafunguwe mu turere tw’icyaro",
      en: "New health centres open in rural districts",
    },
    excerpt: {
      rw: "Ibigo nderabuzima bishya bizagabanya intera abaturage bagenda bashaka ubuvuzi.",
      en: "New clinics will shorten the distance residents travel to reach care.",
    },
    contentTopic: { rw: "ubuzima mu cyaro", en: "rural healthcare" },
    contentLead: {
      rw: "Ivuriro rishya ryafunguwe mu turere tw’icyaro mu rwego rwo kwegereza abaturage serivisi z’ubuzima.",
      en: "New health centres have opened in rural districts as part of an effort to bring care closer to communities.",
    },
    category: "health",
    authorId: "a5",
    tags: ["health", "rural", "services"],
    status: "published",
    featured: true,
    views: 6100,
    source: "Official Statement",
  },
  {
    id: "n5",
    slug: "schools-expand-coding-curriculum",
    seed: "moon-education",
    daysAgo: 3,
    title: {
      rw: "Amashuri yongera amasomo y’ikoranabuhanga mu rwego rw’uburezi",
      en: "Schools expand coding curriculum nationwide",
    },
    excerpt: {
      rw: "Abanyeshuri baziga porogaramu n’ikoranabuhanga guhera mu mashuri abanza.",
      en: "Students will learn programming and digital skills from primary school.",
    },
    contentTopic: { rw: "uburezi bw’ikoranabuhanga", en: "digital education" },
    contentLead: {
      rw: "Amashuri menshi mu gihugu yatangiye kongera amasomo y’ikoranabuhanga no kwiga porogaramu.",
      en: "Schools across the country have begun expanding coding and digital-skills lessons.",
    },
    category: "education",
    authorId: "a1",
    tags: ["education", "coding", "schools"],
    status: "published",
    featured: true,
    views: 4900,
    source: "Moon News",
  },
  {
    id: "n6",
    slug: "parliament-debates-new-trade-bill",
    seed: "moon-politics",
    daysAgo: 4,
    title: {
      rw: "Inteko ishinga amategeko iraganira ku mushinga w’itegeko ry’ubucuruzi",
      en: "Parliament debates a new trade bill",
    },
    excerpt: {
      rw: "Abadepite baganiriye ku ngaruka z’itegeko rishya ku bucuruzi bw’imbere mu gihugu.",
      en: "Lawmakers discussed the bill's impact on domestic commerce.",
    },
    contentTopic: { rw: "itegeko ry’ubucuruzi", en: "the new trade bill" },
    contentLead: {
      rw: "Inteko ishinga amategeko yaganiriye ku mushinga w’itegeko rishya ry’ubucuruzi.",
      en: "Parliament has debated a proposed trade bill that could reshape domestic commerce.",
    },
    category: "politics",
    authorId: "a1",
    tags: ["politics", "parliament", "trade"],
    status: "published",
    views: 3700,
    source: "Official Statement",
  },
  {
    id: "n7",
    slug: "african-summit-focuses-on-climate-finance",
    seed: "moon-summit",
    daysAgo: 5,
    title: {
      rw: "Inama y’Afurika yibanze ku mafaranga yo kurwanya imihindagurikire y’ikirere",
      en: "African summit focuses on climate finance",
    },
    excerpt: {
      rw: "Abayobozi b’ibihugu bya Afurika baganiriye ku nkunga y’ibikorwa by’ikirere.",
      en: "African leaders discussed funding for climate adaptation projects.",
    },
    contentTopic: { rw: "imihindagurikire y’ikirere", en: "climate finance" },
    contentLead: {
      rw: "Inama y’abayobozi ba Afurika yibanze ku buryo bwo gushaka amafaranga yo kurwanya imihindagurikire y’ikirere.",
      en: "A summit of African leaders centred on how to unlock financing for climate adaptation.",
    },
    category: "international",
    authorId: "a6",
    tags: ["africa", "climate", "diplomacy"],
    status: "published",
    views: 5200,
    source: "Partner Publication",
  },
  {
    id: "n8",
    slug: "coffee-exports-reach-record-high",
    seed: "moon-coffee",
    daysAgo: 6,
    title: {
      rw: "Ibicuruzwa by’ikawa byoherejwe hanze byageze ku rwego rwo hejuru",
      en: "Coffee exports reach a record high",
    },
    excerpt: {
      rw: "Abahinzi b’ikawa bungutse nyuma y’uko ibiciro byiyongereye ku isoko mpuzamahanga.",
      en: "Coffee farmers benefited as prices rose on international markets.",
    },
    contentTopic: { rw: "ubuhinzi bw’ikawa", en: "the coffee sector" },
    contentLead: {
      rw: "Ibicuruzwa by’ikawa byoherejwe hanze byageze ku rwego rwo hejuru, bitera inyungu abahinzi.",
      en: "Coffee exports hit a record high this season, delivering strong returns to growers.",
    },
    category: "agriculture",
    authorId: "a3",
    tags: ["agriculture", "coffee", "exports"],
    status: "published",
    views: 2900,
    source: "Moon News",
  },
  {
    id: "n9",
    slug: "national-park-conservation-expansion",
    seed: "moon-park",
    daysAgo: 7,
    title: {
      rw: "Parike y’igihugu yagutse ibikorwa byo kubungabunga ibidukikije",
      en: "National park expands conservation programme",
    },
    excerpt: {
      rw: "Ibikorwa bishya bizafasha kurinda inyamaswa no guteza imbere ubukerarugendo.",
      en: "New efforts will protect wildlife and grow eco-tourism.",
    },
    contentTopic: { rw: "kubungabunga ibidukikije", en: "conservation" },
    contentLead: {
      rw: "Parike y’igihugu yatangije ibikorwa bishya byo kubungabunga ibidukikije no guteza imbere ubukerarugendo.",
      en: "A national park has launched an expanded conservation programme alongside eco-tourism initiatives.",
    },
    category: "environment",
    authorId: "a5",
    tags: ["environment", "conservation", "tourism"],
    status: "published",
    views: 3400,
    source: "Moon News",
  },
  {
    id: "n10",
    slug: "kigali-tech-startups-attract-funding",
    seed: "moon-startups",
    daysAgo: 1,
    hoursAgo: 8,
    title: {
      rw: "Ibigo bito by’ikoranabuhanga i Kigali byabonye inkunga y’amafaranga",
      en: "Kigali tech startups attract new funding",
    },
    excerpt: {
      rw: "Ibigo by’ishoramari byashoye imari mu bigo bito bikora ikoranabuhanga.",
      en: "Investors backed early-stage technology companies in the capital.",
    },
    contentTopic: { rw: "ibigo bito by’ikoranabuhanga", en: "the startup ecosystem" },
    contentLead: {
      rw: "Ibigo bito by’ikoranabuhanga i Kigali byabonye inkunga nshya y’amafaranga ivuye ku bashoramari.",
      en: "Kigali-based tech startups have secured fresh funding rounds from regional and international investors.",
    },
    category: "technology",
    authorId: "a2",
    tags: ["startups", "funding", "technology"],
    status: "published",
    views: 7100,
    source: "Moon News",
  },
  {
    id: "n11",
    slug: "music-festival-returns-to-kigali",
    seed: "moon-festival",
    daysAgo: 8,
    title: {
      rw: "Iserukiramuco ry’umuziki ryagarutse i Kigali",
      en: "Music festival returns to Kigali",
    },
    excerpt: {
      rw: "Abahanzi bo mu Rwanda no mu karere bitabiriye iserukiramuco ry’umuziki.",
      en: "Local and regional artists headline a weekend of live performances.",
    },
    contentTopic: { rw: "iserukiramuco ry’umuziki", en: "the music festival" },
    contentLead: {
      rw: "Iserukiramuco ry’umuziki ryagarutse i Kigali, rikaba ryitabiriwe n’abahanzi bo mu Rwanda no mu karere.",
      en: "A popular music festival has returned to Kigali, drawing artists from Rwanda and across the region.",
    },
    category: "entertainment",
    authorId: "a1",
    tags: ["music", "culture", "entertainment"],
    status: "published",
    views: 4200,
    source: "Moon News",
  },
  {
    id: "n12",
    slug: "rwandan-science-team-studies-lake-kivu",
    seed: "moon-science",
    daysAgo: 9,
    title: {
      rw: "Itsinda ry’abahanga ryiga ku nyanja ya Kivu",
      en: "Rwandan science team studies Lake Kivu",
    },
    excerpt: {
      rw: "Abashakashatsi bariga uburyo bwo gukoresha umutungo wa Kivu mu buryo butekanye.",
      en: "Researchers explore safe use of the lake's unique resources.",
    },
    contentTopic: { rw: "ubushakashatsi kuri Kivu", en: "Lake Kivu research" },
    contentLead: {
      rw: "Itsinda ry’abahanga mu Rwanda ryatangiye ubushakashatsi ku nyanja ya Kivu.",
      en: "A Rwandan research team has begun a scientific study of Lake Kivu's unique properties.",
    },
    category: "science",
    authorId: "a5",
    tags: ["science", "research", "energy"],
    status: "published",
    views: 2600,
    source: "Moon News",
  },
  {
    id: "n13",
    slug: "cultural-heritage-festival-celebrated",
    seed: "moon-culture",
    daysAgo: 10,
    title: {
      rw: "Iserukiramuco ry’umuco nyarwanda ryizihijwe",
      en: "Cultural heritage festival celebrated nationwide",
    },
    excerpt: {
      rw: "Abaturage bizihije umuco nyarwanda binyuze mu mbyino, imivugo n’ubugeni.",
      en: "Communities marked the occasion with dance, poetry and craft.",
    },
    contentTopic: { rw: "umuco nyarwanda", en: "Rwandan culture" },
    contentLead: {
      rw: "Iserukiramuco ry’umuco nyarwanda ryizihijwe mu gihugu hose, hagaragazwa imbyino, imivugo n’ubugeni.",
      en: "A cultural heritage festival was celebrated nationwide, showcasing dance, poetry and traditional craft.",
    },
    category: "culture",
    authorId: "a1",
    tags: ["culture", "heritage", "festival"],
    status: "published",
    views: 3100,
    source: "Moon News",
  },
  {
    id: "n14",
    slug: "national-basketball-team-prepares",
    seed: "moon-basketball",
    daysAgo: 2,
    hoursAgo: 12,
    title: {
      rw: "Ikipe y’igihugu ya basketball iritegura amarushanwa",
      en: "National basketball team prepares for tournament",
    },
    excerpt: {
      rw: "Abakinnyi batangiye imyitozo yo kwitegura amarushanwa mpuzamahanga.",
      en: "Players have begun training camp ahead of international competition.",
    },
    contentTopic: { rw: "ikipe ya basketball", en: "the national basketball team" },
    contentLead: {
      rw: "Ikipe y’igihugu ya basketball iritegura amarushanwa mpuzamahanga hifashishijwe imyitozo ikarishye.",
      en: "The national basketball team is preparing for its next international tournament with an intensive training camp.",
    },
    category: "sports",
    authorId: "a4",
    tags: ["basketball", "sports", "national-team"],
    status: "published",
    views: 5400,
    source: "Moon News",
  },
  {
    id: "n15",
    slug: "renewable-energy-project-announced",
    seed: "moon-energy",
    daysAgo: 11,
    title: {
      rw: "Umushinga w’ingufu zisubira watangajwe",
      en: "Renewable energy project announced",
    },
    excerpt: {
      rw: "Umushinga mushya w’ingufu z’izuba uzongera amashanyarazi mu gihugu.",
      en: "A new solar project will increase electricity supply nationwide.",
    },
    contentTopic: { rw: "ingufu zisubira", en: "renewable energy" },
    contentLead: {
      rw: "Umushinga w’ingufu zisubira watangajwe, ukazafasha kongera amashanyarazi mu gihugu.",
      en: "A renewable energy project has been announced that will expand electricity supply across Rwanda.",
    },
    category: "environment",
    authorId: "a6",
    tags: ["energy", "environment", "infrastructure"],
    status: "published",
    views: 2800,
    source: "Official Statement",
  },
  {
    id: "n16",
    slug: "mobile-money-growth-report",
    seed: "moon-fintech",
    daysAgo: 12,
    title: {
      rw: "Raporo y’iterambere rya mobile money",
      en: "Mobile money usage continues to grow",
    },
    excerpt: {
      rw: "Umubare w’abakoresha mobile money wiyongereye mu mwaka ushize.",
      en: "The number of mobile money users rose sharply last year.",
    },
    contentTopic: { rw: "mobile money", en: "mobile money" },
    contentLead: {
      rw: "Raporo nshya yerekanye ko ikoreshwa rya mobile money rikomeje kwiyongera mu Rwanda.",
      en: "A new report shows mobile money adoption continuing to climb across Rwanda.",
    },
    category: "business",
    authorId: "a3",
    tags: ["fintech", "mobile-money", "business"],
    status: "published",
    views: 3900,
    source: "Partner Publication",
  },
  {
    id: "n17",
    slug: "vaccination-campaign-expands",
    seed: "moon-vaccine",
    daysAgo: 13,
    title: {
      rw: "Ubwiyongere bw’ubukangurambaga bwo gukingira",
      en: "Vaccination campaign expands to more districts",
    },
    excerpt: {
      rw: "Ubukangurambaga bwo gukingira bwageze mu turere turenze icyarimwe.",
      en: "The immunisation drive reached additional districts this month.",
    },
    contentTopic: { rw: "gukingira", en: "the vaccination campaign" },
    contentLead: {
      rw: "Ubukangurambaga bwo gukingira bwagutse kugera mu turere twinshi tw’igihugu.",
      en: "A national vaccination campaign has expanded to reach more districts.",
    },
    category: "health",
    authorId: "a5",
    tags: ["health", "vaccination", "public-health"],
    status: "published",
    views: 2200,
    source: "Official Statement",
  },
  {
    id: "n18",
    slug: "education-scholarships-announced",
    seed: "moon-scholarship",
    daysAgo: 3,
    hoursAgo: 20,
    title: {
      rw: "Hatangajwe buruse zishyigikira abanyeshuri",
      en: "New scholarships announced for students",
    },
    excerpt: {
      rw: "Abanyeshuri babonye buruse zo kwiga muri za kaminuza zo mu gihugu.",
      en: "Students received funding to study at local universities.",
    },
    contentTopic: { rw: "buruse z’abanyeshuri", en: "student scholarships" },
    contentLead: {
      rw: "Hatangajwe buruse nshya zo gushyigikira abanyeshuri biga muri za kaminuza zo mu gihugu.",
      en: "New scholarships have been announced to support students at universities across Rwanda.",
    },
    category: "education",
    authorId: "a1",
    tags: ["education", "scholarships", "students"],
    status: "published",
    views: 3300,
    source: "Moon News",
  },
  {
    id: "n19",
    slug: "regional-trade-agreement-progress",
    seed: "moon-trade",
    daysAgo: 14,
    title: {
      rw: "Aho amasezerano y’ubucuruzi mu karere ageze",
      en: "Regional trade agreement shows progress",
    },
    excerpt: {
      rw: "Ibihugu byo mu karere byageze ku ntambwe mu biganiro by’ubucuruzi.",
      en: "Neighbouring countries advanced negotiations on trade.",
    },
    contentTopic: { rw: "ubucuruzi mu karere", en: "regional trade" },
    contentLead: {
      rw: "Amasezerano y’ubucuruzi mu karere yerekanye iterambere nyuma y’ibiganiro biheruka.",
      en: "A regional trade agreement has shown progress following the latest round of talks.",
    },
    category: "international",
    authorId: "a6",
    tags: ["trade", "africa", "diplomacy"],
    status: "published",
    views: 2400,
    source: "Partner Publication",
  },
  {
    id: "n20",
    slug: "draft-upcoming-city-plan",
    seed: "moon-city",
    daysAgo: 1,
    title: {
      rw: "Umushinga w’igenamigambi ry’umujyi uri gutegurwa",
      en: "Upcoming city master plan (in preparation)",
    },
    excerpt: {
      rw: "Iyi nkuru iracyategurwa; amakuru arambuye azatangwa vuba.",
      en: "This story is still being prepared; full details will follow.",
    },
    contentTopic: { rw: "igenamigambi ry’umujyi", en: "urban planning" },
    contentLead: {
      rw: "Umushinga w’igenamigambi ry’umujyi uracyategurwa n’inzego zibishinzwe.",
      en: "A city master plan is still being prepared by the relevant authorities.",
    },
    category: "rwanda",
    authorId: "a1",
    tags: ["urban", "planning"],
    status: "draft",
    featured: false,
    breaking: false,
    views: 0,
    source: "Moon News",
  },
  {
    id: "n21",
    slug: "pending-water-project-review",
    seed: "moon-water",
    daysAgo: 0,
    hoursAgo: 5,
    title: {
      rw: "Umushinga w’amazi mu byaro utegereje kwemezwa",
      en: "Rural water project awaits editorial approval",
    },
    excerpt: {
      rw: "Inkuru yatanzwe kugira ngo isuzumwe n’abanyamakuru bakuru.",
      en: "This story has been submitted for editorial review.",
    },
    contentTopic: { rw: "umushinga w’amazi", en: "water access" },
    contentLead: {
      rw: "Umushinga mushya w’amazi uzafasha abaturage bo mu byaro kubona amazi meza.",
      en: "A new water project will help rural residents access clean water.",
    },
    category: "environment",
    authorId: "a1",
    tags: ["water", "rural", "infrastructure"],
    status: "pending",
    featured: false,
    breaking: false,
    views: 0,
    source: "Moon News",
  },
  {
    id: "n22",
    slug: "rejected-opinion-piece",
    seed: "moon-opinion",
    daysAgo: 2,
    title: {
      rw: "Igitekerezo cyanzwe: impamvu byanze kwemezwa",
      en: "Opinion piece: reasons it was not approved",
    },
    excerpt: {
      rw: "Iyi nkuru yanzwe; reba ibisobanuro by’umwanditsi mukuru.",
      en: "This submission was rejected; see the editor's notes.",
    },
    contentTopic: { rw: "igitekerezo", en: "editorial opinion" },
    contentLead: {
      rw: "Iyi nkuru yari igitekerezo cy’umwanditsi itarubahirije amabwiriza.",
      en: "This submission was an opinion piece that did not meet the guidelines.",
    },
    category: "politics",
    authorId: "a1",
    tags: ["opinion", "policy"],
    status: "rejected",
    featured: false,
    breaking: false,
    views: 0,
    source: "Moon News",
  },
];

export const articles: Article[] = seeds.map((s, index) => ({
  id: s.id,
  slug: s.slug,
  title: s.title,
  subtitle: s.subtitle,
  excerpt: s.excerpt,
  content: body(s.contentTopic, s.contentLead),
  category: s.category as CategorySlug,
  authorId: s.authorId,
  image: img(s.seed),
  imageCaption: s.imageCaption,
  publishedAt: iso(s.daysAgo, s.hoursAgo ?? 0),
  updatedAt: index % 3 === 0 ? iso(Math.max(0, s.daysAgo - 1)) : undefined,
  readingTime: s.readingTime ?? 3 + (index % 6),
  views: s.views ?? 1000 + index * 137,
  shares: 40 + ((index * 53) % 320),
  commentsCount: (index * 7) % 24,
  tags: s.tags,
  status: s.status,
  featured: s.featured ?? false,
  breaking: s.breaking ?? false,
  source: s.source,
  seo: {
    title: `${s.title.en} | Moon News`,
    description: s.excerpt.en,
    ogImage: img(s.seed, 1200, 630),
  },
}));
