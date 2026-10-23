import type { Metadata } from "next";
import { AuthorCard } from "@/components/AuthorCard";
import { authors } from "@/lib/data/authors";
import { articles } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Authors & Journalists",
  description: "Meet the Moon News journalists and editors reporting from Rwanda and beyond.",
};

export default function AuthorsPage() {
  return (
    <div className="container-page py-8">
      <div className="mb-8 border-b border-border pb-4">
        <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">
          Authors &amp; Journalists
        </h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
          Abanyamakuru n&apos;abanditsi ba Moon News — the people behind the reporting.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((a) => (
          <AuthorCard
            key={a.id}
            author={a}
            articleCount={articles.filter((x) => x.authorId === a.id && x.status === "published").length}
          />
        ))}
      </div>
    </div>
  );
}
