import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Newsletter } from "@/components/Newsletter";

export const metadata: Metadata = {
  title: "About Us",
  description: "About Moon News — a Rwanda-based digital newsroom. Trusted News. Right on Time.",
};

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-8 flex items-center gap-4">
        <LogoMark className="h-14 w-14" />
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight">About Moon News</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">Amakuru y&apos;ukuri, ku gihe.</p>
        </div>
      </div>

      <div className="prose-article">
        <p>
          Moon News is a Rwanda-based digital news platform built to deliver fast, organized and
          trustworthy coverage in both Kinyarwanda and English. Our mission is simple: give every
          reader accurate information, right on time.
        </p>
        <h2>Our mission</h2>
        <p>
          We report on Rwanda and the world across politics, business, sports, technology, health,
          education, entertainment, environment, agriculture, culture and science — with original
          journalism and clear attribution.
        </p>
        <h2 id="careers">Careers</h2>
        <p>
          We are always looking for curious, rigorous journalists and engineers. To apply, send your
          portfolio to <a href="mailto:careers@moonnews.rw">careers@moonnews.rw</a>.
        </p>
        <h2 id="advertise">Advertise</h2>
        <p>
          Reach an engaged, bilingual audience. For advertising and sponsorship opportunities,
          contact <a href="mailto:ads@moonnews.rw">ads@moonnews.rw</a>.
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/contact" className="btn-primary">Contact us</Link>
        <Link href="/" className="btn-outline">Back to Home</Link>
      </div>

      <div className="mt-14">
        <Newsletter />
      </div>
    </div>
  );
}
