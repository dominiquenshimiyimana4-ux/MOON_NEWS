"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Globe, LogOut, Mail, Pencil, Share2, Twitter, Linkedin, Settings } from "lucide-react";
import { useAuthor } from "@/lib/author/AuthorProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { roleLabels } from "@/lib/services/authService";
import { formatCount, formatDate } from "@/lib/utils";
import { PageHeader, StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/EmptyState";

export default function AuthorProfilePage() {
  const { profile, user, myArticles, hydrated } = useAuthor();
  const { logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    position: profile?.position ?? "",
    bio: profile?.bio ?? "",
    twitter: profile?.social.twitter ?? "",
    linkedin: profile?.social.linkedin ?? "",
  });
  const [saved, setSaved] = useState(false);

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  if (!profile || !user) {
    return (
      <EmptyState
        title="No author profile"
        description="Your account isn't linked to an author profile yet. Contact an administrator."
      />
    );
  }

  const published = myArticles.filter((a) => a.status === "published");
  const totalViews = published.reduce((s, a) => s + a.views, 0);

  function save(e: React.FormEvent) {
    e.preventDefault();
    // Demo profile edits are session-local; wire to PATCH /api/authors/:id to persist.
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Your public author page and account details."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/authors/${profile.slug}`} target="_blank" className="btn-outline">
              <Globe className="h-4 w-4" /> View public page
            </Link>
            <Link href="/settings" className="btn-outline">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </div>
        }
      />

      {saved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Check className="h-4 w-4" /> Profile updated.
        </div>
      )}

      {/* Header card */}
      <div className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-700 to-accent-500" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="relative h-20 w-20 overflow-hidden rounded-full bg-brand-100 ring-4 ring-[rgb(var(--surface))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
            </span>
            <div className="sm:pb-1">
              <h2 className="font-serif text-2xl font-extrabold">{profile.name}</h2>
              <p className="text-sm text-[rgb(var(--text-muted))]">{profile.position}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <span className="chip bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {roleLabels[user.role]}
              </span>
              <button type="button" onClick={() => setEditing((v) => !v)} className="btn-outline h-9 !py-0">
                <Pencil className="h-4 w-4" /> Edit profile
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                className="btn-ghost h-9 !py-0 text-red-600"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!editing && <p className="mt-5 max-w-2xl text-sm text-[rgb(var(--text))]">{profile.bio}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Published stories" value={published.length} icon={<Pencil className="h-5 w-5" />} accent="#16a34a" />
        <StatCard label="Total reads" value={formatCount(totalViews)} icon={<Share2 className="h-5 w-5" />} accent="#2563eb" />
        <StatCard label="Drafts" value={myArticles.filter((a) => a.status === "draft").length} icon={<Pencil className="h-5 w-5" />} accent="#ca8a04" />
        <StatCard label="Pending review" value={myArticles.filter((a) => a.status === "pending").length} icon={<Pencil className="h-5 w-5" />} accent="#4f46e5" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Account details */}
        <div className="card p-5">
          <h3 className="mb-4 font-serif text-base font-bold">Account</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[rgb(var(--text-muted))]">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-[rgb(var(--text-muted))]"><Mail className="h-3.5 w-3.5" /> Email</dt>
              <dd className="truncate font-medium">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[rgb(var(--text-muted))]">Role</dt>
              <dd className="font-medium">{roleLabels[user.role]}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[rgb(var(--text-muted))]">Member since</dt>
              <dd className="font-medium">{formatDate(user.createdAt, "en")}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[rgb(var(--text-muted))]">Profile URL</dt>
              <dd className="truncate font-mono text-xs">/authors/{profile.slug}</dd>
            </div>
          </dl>
        </div>

        {/* Editable public profile */}
        <div className="card p-5">
          <h3 className="mb-4 font-serif text-base font-bold">Public profile</h3>
          {editing ? (
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label" htmlFor="position">Position</label>
                <input
                  id="position"
                  className="input"
                  value={draft.position}
                  onChange={(e) => setDraft({ ...draft, position: e.target.value })}
                  placeholder="e.g. Technology Reporter"
                />
              </div>
              <div>
                <label className="label" htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  rows={4}
                  className="input resize-y"
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="twitter">X / Twitter</label>
                  <input
                    id="twitter"
                    className="input"
                    value={draft.twitter}
                    onChange={(e) => setDraft({ ...draft, twitter: e.target.value })}
                    placeholder="https://x.com/…"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="linkedin">LinkedIn</label>
                  <input
                    id="linkedin"
                    className="input"
                    value={draft.linkedin}
                    onChange={(e) => setDraft({ ...draft, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/…"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary"><Check className="h-4 w-4" /> Save</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">Bio</p>
                <p className="mt-1">{profile.bio}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">Social</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.social.twitter && (
                    <a href={profile.social.twitter} target="_blank" rel="noreferrer" className="btn-outline h-8 !py-0 text-xs">
                      <Twitter className="h-3.5 w-3.5" /> X / Twitter
                    </a>
                  )}
                  {profile.social.linkedin && (
                    <a href={profile.social.linkedin} target="_blank" rel="noreferrer" className="btn-outline h-8 !py-0 text-xs">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {profile.social.email && (
                    <a href={`mailto:${profile.social.email}`} className="btn-outline h-8 !py-0 text-xs">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                  )}
                  {!profile.social.twitter && !profile.social.linkedin && !profile.social.email && (
                    <span className="text-sm text-[rgb(var(--text-muted))]">No social links yet.</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        Profile edits are session-local for the demo. Connect <code>PATCH /api/authors/:id</code> to persist them.
      </p>
    </div>
  );
}
