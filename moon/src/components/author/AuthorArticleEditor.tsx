"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, Loader2, Save, Send, Timer, UploadCloud } from "lucide-react";
import type { Article, ArticleStatus, CategorySlug } from "@/lib/types";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { categories } from "@/lib/data/categories";
import { slugify } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";
import { UploadButton } from "@/components/admin/UploadButton";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  imageCaption: string;
  category: CategorySlug;
  tags: string;
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
}

function emptyForm(): FormState {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "https://picsum.photos/seed/moonauthor/1200/800",
    imageCaption: "",
    category: "rwanda",
    tags: "",
    publishDate: new Date().toISOString().slice(0, 16),
    seoTitle: "",
    seoDescription: "",
  };
}

function fromArticle(a: Article): FormState {
  return {
    title: a.title.en,
    slug: a.slug,
    excerpt: a.excerpt.en,
    content: a.content.en,
    image: a.image,
    imageCaption: a.imageCaption ?? "",
    category: a.category,
    tags: a.tags.join(", "),
    publishDate: a.publishedAt.slice(0, 16),
    seoTitle: a.seo?.title ?? "",
    seoDescription: a.seo?.description ?? "",
  };
}

/**
 * Author-facing article editor. Reuses the admin editor's form model but is
 * scoped to the signed-in writer: they cannot pick another author, and the
 * primary actions are "Save draft" and "Submit for review".
 */
export function AuthorArticleEditor({ existing }: { existing?: Article }) {
  const router = useRouter();
  const { hydrated, profile, createArticle, updateArticle } = useAuthor();
  const [form, setForm] = useState<FormState>(existing ? fromArticle(existing) : emptyForm());
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!existing);

  const autoSlug = useMemo(() => slugify(form.title), [form.title]);
  const effectiveSlug = slugTouched && form.slug ? form.slug : autoSlug;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedMessage(null);
  }

  function persist(status: ArticleStatus, message: string) {
    setSaving(true);
    const payload = {
      title: form.title || "Untitled article",
      slug: effectiveSlug,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      imageCaption: form.imageCaption,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      featured: false,
      breaking: false,
      publishedAt: new Date(form.publishDate).toISOString(),
      seo: { title: form.seoTitle, description: form.seoDescription },
    };
    if (existing) updateArticle(existing.id, payload as never);
    else createArticle(payload as never);
    setTimeout(() => {
      setSaving(false);
      setSavedMessage(message);
      router.push("/author/articles");
    }, 450);
  }

  function preview() {
    if (!effectiveSlug) {
      alert("Add a title first to preview.");
      return;
    }
    window.open(`/news/${form.category}/${effectiveSlug}`, "_blank", "noopener,noreferrer");
  }

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading editor…</div>;

  if (!profile) {
    return (
      <div className="text-sm text-[rgb(var(--text-muted))]">
        No author profile is linked to your account. Contact an administrator.
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={existing ? "Edit article" : "Create Article"}
        subtitle={existing ? existing.title.en : "Write a new story for Moon News."}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={preview} className="btn-outline">
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button type="button" onClick={() => persist("draft", "Draft saved.")} disabled={saving} className="btn-outline">
              <Save className="h-4 w-4" /> Save draft
            </button>
            <button
              type="button"
              onClick={() => persist("pending", "Submitted for review.")}
              disabled={saving}
              className="btn-outline"
            >
              <Send className="h-4 w-4" /> Submit for review
            </button>
            <button
              type="button"
              onClick={() => persist("published", "Article published — it is now live on the site.")}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Publish
            </button>
          </div>
        }
      />

      {savedMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check className="h-4 w-4" /> {savedMessage}
        </div>
      )}

      <div className="mb-5 flex items-start gap-2 rounded-lg border border-border bg-[rgb(var(--bg-subtle))] px-3 py-2 text-xs text-[rgb(var(--text-muted))]">
        <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Use <span className="font-semibold text-[rgb(var(--text))]">Publish</span> to make the story live on the
        site immediately, or submit it for editorial review. Published stories appear on the home page
        and can be found in{" "}
        <Link href="/author/articles" className="font-semibold text-brand-600 hover:underline">
          My Articles
        </Link>
        .
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Field label="Title">
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className="input text-base" placeholder="Article headline" />
          </Field>
          <Field label="Slug" hint={slugTouched ? undefined : `Auto: /news/${form.category}/${autoSlug}`}>
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              className="input font-mono text-sm"
              placeholder="article-slug"
            />
          </Field>
          <Field label="Excerpt">
            <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={2} className="input resize-y" placeholder="A short summary shown on cards." />
          </Field>
          <Field label="Content" hint="Supports ## headings, > quotes, and - lists.">
            <textarea value={form.content} onChange={(e) => update("content", e.target.value)} rows={16} className="input resize-y font-mono text-sm" placeholder="Write the full article…" />
          </Field>
          <Field label="Tags" hint="Comma separated">
            <input value={form.tags} onChange={(e) => update("tags", e.target.value)} className="input" placeholder="rwanda, technology, innovation" />
          </Field>
        </div>

        <div className="space-y-5">
          <div className="card space-y-4 p-5">
            <h3 className="font-serif text-base font-bold">Publishing</h3>
            <div className="rounded-lg bg-[rgb(var(--bg-subtle))] p-3 text-sm">
              <p className="text-xs text-[rgb(var(--text-muted))]">Byline</p>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-xs text-[rgb(var(--text-muted))]">{profile.position}</p>
            </div>
            <Field label="Category">
              <select value={form.category} onChange={(e) => update("category", e.target.value as CategorySlug)} className="input">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name.en}</option>
                ))}
              </select>
            </Field>
            <Field label="Publish date">
              <input type="datetime-local" value={form.publishDate} onChange={(e) => update("publishDate", e.target.value)} className="input" />
            </Field>
          </div>

          <div className="card space-y-4 p-5">
            <h3 className="font-serif text-base font-bold">Featured image</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[rgb(var(--bg-subtle))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <Field label="Image URL">
              <input value={form.image} onChange={(e) => update("image", e.target.value)} className="input text-sm" />
            </Field>
            <UploadButton kind="image" label="Upload image" onUploaded={(file) => update("image", file.url)} />
            <Field label="Caption">
              <input value={form.imageCaption} onChange={(e) => update("imageCaption", e.target.value)} className="input text-sm" />
            </Field>
            <Link href="/author/media" className="text-sm font-semibold text-brand-600 hover:underline">
              Open media library →
            </Link>
          </div>

          <div className="card space-y-4 p-5">
            <h3 className="font-serif text-base font-bold">SEO</h3>
            <Field label="SEO title">
              <input value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} className="input text-sm" placeholder={form.title} />
            </Field>
            <Field label="SEO description">
              <textarea value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} rows={3} className="input resize-y text-sm" placeholder={form.excerpt} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[rgb(var(--text-muted))]">{hint}</span>}
    </label>
  );
}
