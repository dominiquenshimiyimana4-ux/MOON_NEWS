import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Doc = "privacy" | "terms" | "cookies";

const docs: Record<Doc, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "Moon News respects your privacy. This policy explains what information we collect, how we use it, and the choices you have.",
      "We collect account details you provide (name, email) and technical data needed to operate the service (such as reading history and saved stories, stored locally on your device in this demo).",
      "We do not sell your personal information. We use it to personalise your experience, send the newsletter you subscribe to, and improve our journalism.",
      "You can request access to, correction of, or deletion of your personal data at any time by contacting privacy@moonnews.rw.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By using Moon News you agree to these terms. Our content is for personal, non-commercial use unless otherwise licensed.",
      "Moon News articles, branding, logos and design are original works owned by Moon News. Do not reproduce them without permission.",
      "You agree not to misuse the service, interfere with its operation, or attempt to access it by unauthorised means.",
      "We may update these terms from time to time. Continued use of the service constitutes acceptance of the updated terms.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    body: [
      "Cookies help us remember your preferences, such as language (Kinyarwanda or English) and theme (light, dark or system).",
      "In this demo, preferences and saved stories are stored in your browser's local storage rather than tracking cookies.",
      "You can clear stored preferences at any time from your browser settings or from the Settings page.",
      "We do not use cookies to build advertising profiles of our readers.",
    ],
  },
};

export function generateStaticParams() {
  return (Object.keys(docs) as Doc[]).map((doc) => ({ doc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  if (!(doc in docs)) return { title: "Not found" };
  return { title: docs[doc as Doc].title, description: `Moon News — ${docs[doc as Doc].title}` };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  if (!(doc in docs)) notFound();
  const { title, body } = docs[doc as Doc];

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="mb-6 font-serif text-3xl font-extrabold tracking-tight">{title}</h1>
      <div className="prose-article">
        {body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className="text-sm text-[rgb(var(--text-muted))]">Last updated: January 2026.</p>
      </div>
    </div>
  );
}
