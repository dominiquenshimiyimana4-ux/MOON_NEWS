import type { Metadata } from "next";
import { Newsletter } from "@/components/Newsletter";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Subscribe to the Moon News newsletter.",
};

const perks = [
  { rw: "Amakuru y'ingenzi ya buri munsi", en: "A daily digest of the stories that matter" },
  { rw: "Amakuru y'u Rwanda n'ay'amahanga", en: "Rwanda and international coverage" },
  { rw: "Nta spam, wiyandukuze igihe cyose", en: "No spam — unsubscribe anytime" },
];

export default function NewsletterPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <Newsletter />
      <ul className="mt-8 space-y-3">
        {perks.map((p) => (
          <li key={p.en} className="flex items-center gap-3 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
              <Check className="h-4 w-4" />
            </span>
            <span className="text-[rgb(var(--text-muted))]">{p.en} — {p.rw}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
