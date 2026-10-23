"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, Loader2, Save, Send } from "lucide-react";
import type { Article, ArticleStatus, CategorySlug } from "@/lib/types";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { categories } from "@/lib/data/categories";
import { authors } from "@/lib/data/authors";
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
  authorId: string;
  tags: string;
  status: ArticleStatus;
  featured: boolean;
  breaking: boolean;
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
    image: "https://picsum.photos/seed/moonnew/1200/800",
    imageCaption: "",
    category: "rwanda",
    authorId: authors[0].id,
    tags: "",
    status: "draft",
    featured: false,
    breaking: false,
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
    authorId: a.authorId,
    tags: a.tags.join(", "),
    status: a.status,
    featured: a.featured,
    breaking: a.breaking,
    publishDate: a.publishedAt.slice(0, 16),
    seoTitle: a.seo?.title ?? "",
    seoDescription: a.seo?.description ?? "",
  };
}

export function ArticleEditor({ existing }: { existing?: Article }) {
  const router = useRouter();
  const { createArticle, updateArticle, hydrated } = useAdmin();
  const [form, setForm] = useState<FormState>(existing ? fromArticle(existing) : emptyForm());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!existing);

  const autoSlug = useMemo(() => slugify(form.title), [form.title]);
  const effectiveSlug = slugTouched && form.slug ? form.slug : autoSlug;

  useEffect(() => {
    if (existing) setForm(fromArticle(existing));
  }, [existing]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function persist(status: ArticleStatus) {
    setSaving(true);
    const payload = {
      title: form.title || "Untitled article",
      slug: effectiveSlug,
      excerpt: form.excerpt,
      content: form.content,
      image: form.image,
      imageCaption: form.imageCaption,
      category: form.category,
      authorId: form.authorId,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      featured: form.featured,
      breaking: form.breaking,
      publishedAt: new Date(form.publishDate).toISOString(),
      seo: { title: form.seoTitle, description: form.seoDescription },
    };
    if (existing) updateArticle(existing.id, payload as never);
    else createArticle(payload as never);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      router.push("/admin/articles");
    }, 500);
  }

  function preview() {
    if (!effectiveSlug) {
      alert("Add a title first to preview.");
      return;
    }
    window.open(`/news/${form.category}/${effectiveSlug}`, "_blank", "noopener,noreferrer");
  }

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading editor…</div>;

  return (
    <div>
      <PageHeader
        title={existing ? "Edit article" : "New article"}
        subtitle={existing ? existing.title.en : "Create a new story for Moon News."}
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={preview} className="btn-outline">
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button type="button" onClick={() => persist("draft")} disabled={saving} className="btn-outline">
              <Save className="h-4 w-4" /> Save draft
            </button>
            <button type="button" onClick={() => persist("published")} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish
            </button>
          </div>
        }
      />

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check className="h-4 w-4" /> Saved.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <Field label="Title">
            <input value={form.title} onChange={(e) => update("title", e.target.value)} className="input text-base" placeholder="Article headline" />
          </Field>
          <Field label="Slug" hint={slugTouched ? undefined : `Auto: /news/${form.category}/${autoSlug}`}>
            <div className="flex items-center gap-2">
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", e.target.value);
                }}
                className="input font-mono text-sm"
                placeholder="article-slug"
              />
            </div>
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

        {/* Sidebar column */}
        <div className="space-y-5">
          <div className="card space-y-4 p-5">
            <h3 className="font-serif text-base font-bold">Publishing</h3>
            <Field label="Status">
              <select value={form.status} onChange={(e) => update("status", e.target.value as ArticleStatus)} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </Field>
            <Field label="Publish date">
              <input type="datetime-local" value={form.publishDate} onChange={(e) => update("publishDate", e.target.value)} className="input" />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => update("category", e.target.value as CategorySlug)} className="input">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name.en}</option>
                ))}
              </select>
            </Field>
            <Field label="Author">
              <select value={form.authorId} onChange={(e) => update("authorId", e.target.value)} className="input">
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
            <div className="flex items-center justify-between">
              <Toggle label="Featured" checked={form.featured} onChange={(v) => update("featured", v)} />
              <Toggle label="Breaking" checked={form.breaking} onChange={(v) => update("breaking", v)} />
            </div>
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
            <UploadButton
              kind="image"
              label="Upload image"
              onUploaded={(file) => update("image", file.url)}
            />
            <Field label="Caption">
              <input value={form.imageCaption} onChange={(e) => update("imageCaption", e.target.value)} className="input text-sm" />
            </Field>
            <Link href="/admin/media" className="text-sm font-semibold text-brand-600 hover:underline">
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-sm font-medium">
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-[rgb(var(--border))]"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
      {label}
    </button>
  );
}
