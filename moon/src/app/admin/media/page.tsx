"use client";

import { useMemo, useState } from "react";
import { ImagePlus, Search, Trash2, Upload } from "lucide-react";
import { useAdmin } from "@/lib/admin/AdminProvider";
import { UploadDropzone, type UploadedFile } from "@/components/admin/UploadButton";
import { formatBytes } from "@/lib/admin/upload";
import { PageHeader } from "@/components/admin/StatCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";



export default function MediaLibraryPage() {
  const { media, hydrated, addMedia, deleteMedia } = useAdmin();
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", url: "", alt: "", type: "image" as "image" | "video" });

  const filtered = useMemo(
    () =>
      media.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.alt.toLowerCase().includes(query.toLowerCase())
      ),
    [media, query]
  );

  function handleLocalUpload(file: UploadedFile) {
    addMedia({ name: file.name, url: file.url, type: file.type, size: file.size, alt: file.alt });
  }

  function submitUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.url.trim()) return;
    addMedia({
      name: form.name.trim() || form.url.split("/").pop() || "upload.jpg",
      url: form.url.trim(),
      alt: form.alt.trim(),
      type: form.type,
      size: Math.round(120000 + Math.random() * 400000),
    });
    setForm({ name: "", url: "", alt: "", type: "image" });
    setUploading(false);
  }

  if (!hydrated) return <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>;

  return (
    <div>
      <PageHeader
        title="Media Library"
        subtitle={`${media.length} files`}
        action={
          <button type="button" onClick={() => setUploading((v) => !v)} className="btn-primary">
            <ImagePlus className="h-4 w-4" /> Upload
          </button>
        }
      />

      <UploadDropzone onUploaded={handleLocalUpload} />

      {uploading && (
        <form onSubmit={submitUpload} className="card mb-5 grid gap-3 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="label">File URL</span>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input" placeholder="https://…/image.jpg" required />
            <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
              Demo upload: paste a public image/video URL. Real uploads go to your storage backend.
            </p>
          </div>
          <div>
            <span className="label">File name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="headline-photo.jpg" />
          </div>
          <div>
            <span className="label">Alt text</span>
            <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className="input" placeholder="Describe the image" />
          </div>
          <div>
            <span className="label">Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "image" | "video" })} className="input">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary"><Upload className="h-4 w-4" /> Add file</button>
            <button type="button" onClick={() => setUploading(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search media…" className="input !pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No media found" description="Upload an image or adjust your search." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <div key={m.id} className="card group overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-[rgb(var(--bg-subtle))]">
                {m.type === "image" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={m.url} className="h-full w-full object-cover" muted />
                )}
                <button
                  type="button"
                  onClick={() => setConfirmId(m.id)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="mt-0.5 truncate text-xs text-[rgb(var(--text-muted))]">{m.alt || "No alt text"}</p>
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                  {m.type} · {formatBytes(m.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete file?"
          message="This will remove the file from the library."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteMedia(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}
