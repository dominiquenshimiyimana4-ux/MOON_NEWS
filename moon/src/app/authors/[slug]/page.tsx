import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Facebook, Linkedin, Mail, Twitter } from "lucide-react";
import { authors } from "@/lib/data/authors";
import { newsService } from "@/lib/services/newsService";
import { NewsCard } from "@/components/NewsCard";
import { EmptyState } from "@/components/EmptyState";

export function generateStaticParams() {
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) return { title: "Author not found" };
  return {
    title: author.name,
    description: `${author.name} — ${author.position} at Moon News.`,
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) notFound();

  const written = await newsService.getByAuthor(author.id);

  const socials = [
    author.social.twitter && { label: "X", href: author.social.twitter, icon: Twitter },
    author.social.facebook && { label: "Facebook", href: author.social.facebook, icon: Facebook },
    author.social.linkedin && { label: "LinkedIn", href: author.social.linkedin, icon: Linkedin },
    author.social.email && { label: "Email", href: `mailto:${author.social.email}`, icon: Mail },
  ].filter(Boolean) as { label: string; href: string; icon: typeof Twitter }[];

  return (
    <div className="container-page py-8">
      <div className="card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-700 to-brand-900" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-[rgb(var(--surface))]">
              <Image src={author.avatar} alt={author.name} fill sizes="96px" className="object-cover" />
            </span>
            <div className="sm:pb-1">
              <h1 className="font-serif text-2xl font-extrabold">{author.name}</h1>
              <p className="text-sm text-[rgb(var(--text-muted))]">{author.position}</p>
            </div>
            <div className="flex gap-2 sm:ml-auto">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-[rgb(var(--text-muted))] transition-colors hover:border-brand-500 hover:text-brand-600"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[rgb(var(--text-muted))]">{author.bio}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-5 font-serif text-2xl font-extrabold">
          Articles <span className="text-base font-medium text-[rgb(var(--text-muted))]">({written.length})</span>
        </h2>
        {written.length === 0 ? (
          <EmptyState title="No articles yet" description="Stories from this author will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {written.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link href="/authors" className="text-sm font-semibold text-brand-600 hover:underline">
          ← All authors
        </Link>
      </div>
    </div>
  );
}
