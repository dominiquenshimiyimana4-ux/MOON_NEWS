"use client";

import { useRef, useState } from "react";
import { FileVideo, ImagePlus, Loader2, Upload, X } from "lucide-react";
import {
  acceptFor,
  formatBytes,
  kindOfFile,
  MAX_UPLOAD_BYTES,
  readFileAsDataUrl,
  type UploadKind,
} from "@/lib/admin/upload";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  name: string;
  url: string;
  type: "image" | "video";
  size: number;
  alt: string;
}

/**
 * Real file picker upload (reads the file into a data URL, so it works with the
 * local-storage demo store). Swap `readFileAsDataUrl` for a call to your storage
 * API when a backend is connected.
 */
export function UploadButton({
  kind = "any",
  label = "Upload",
  className,
  onUploaded,
}: {
  kind?: UploadKind;
  label?: string;
  className?: string;
  onUploaded: (file: UploadedFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const type = kindOfFile(file);
        if (type === "unknown") {
          throw new Error(`"${file.name}" is not a supported image or video file.`);
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`"${file.name}" is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`);
        }
        const url = await readFileAsDataUrl(file);
        onUploaded({ name: file.name, url, type, size: file.size, alt: "" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {label}
        </button>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-outline">
          <ImagePlus className="h-4 w-4" /> Image
        </button>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-outline">
          <FileVideo className="h-4 w-4" /> Video
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptFor(kind)}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-2 flex items-start gap-1 text-xs font-medium text-red-600">
          <X className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/** Large drag-and-drop target used on the media library page. */
export function UploadDropzone({
  kind = "any",
  onUploaded,
}: {
  kind?: UploadKind;
  onUploaded: (file: UploadedFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const type = kindOfFile(file);
        if (type === "unknown") throw new Error(`"${file.name}" is not a supported image or video file.`);
        if (file.size > MAX_UPLOAD_BYTES) {
          throw new Error(`"${file.name}" is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`);
        }
        const url = await readFileAsDataUrl(file);
        onUploaded({ name: file.name, url, type, size: file.size, alt: "" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "mb-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragOver ? "border-brand-600 bg-brand-50 dark:bg-brand-500/10" : "border-border bg-[rgb(var(--surface))]"
      )}
    >
      {busy ? <Loader2 className="mb-2 h-7 w-7 animate-spin text-brand-600" /> : <Upload className="mb-2 h-7 w-7 text-brand-600" />}
      <p className="font-semibold">Drag &amp; drop files here, or click to browse</p>
      <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
        Images and videos · up to {formatBytes(MAX_UPLOAD_BYTES)} per file
      </p>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptFor(kind)}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}