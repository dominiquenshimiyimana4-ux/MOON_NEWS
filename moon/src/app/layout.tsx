import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreakingNews } from "@/components/BreakingNews";
import { MobileTabBar } from "@/components/MobileTabBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { VisitorTracker } from "@/components/analytics/VisitorTracker";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moonnews.rw";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Moon News — Amakuru y'ukuri, ku gihe",
    template: "%s | Moon News",
  },
  description:
    "Moon News is a Rwanda-based digital newsroom delivering trusted, timely coverage in Kinyarwanda and English. Trusted News. Right on Time.",
  keywords: [
    "Moon News",
    "Rwanda news",
    "amakuru",
    "Kinyarwanda",
    "Kigali",
    "politics",
    "business",
    "sports",
    "technology",
  ],
  openGraph: {
    type: "website",
    locale: "rw_RW",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName: "Moon News",
    title: "Moon News — Trusted News. Right on Time.",
    description:
      "Fast, organized and trustworthy Rwanda and international news in Kinyarwanda and English.",
    images: [{ url: "https://picsum.photos/seed/moonnews-og/1200/630", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moon News",
    description: "Trusted News. Right on Time.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0b1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "Moon News",
  slogan: "Amakuru y'ukuri, ku gihe.",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  sameAs: [
    "https://facebook.com/moonnews",
    "https://x.com/moonnews",
    "https://youtube.com/@moonnews",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moon News",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="rw" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Apply the persisted theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('moon_news_theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-page">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <VisitorTracker />
          <OfflineBanner />
          <Header />
          <BreakingNews />
          <main id="main" className="flex-1 pb-16 sm:pb-0">
            {children}
          </main>
          <Footer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
