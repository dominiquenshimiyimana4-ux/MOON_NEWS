"use client";

import { useState } from "react";
import { Loader2, Radio, Save } from "lucide-react";
import type { Channel, ChannelType } from "@/lib/types";

export interface ChannelFormValues {
  stationName: string;
  type: ChannelType;
  description: string;
  location: string;
  streamUrl: string;
  logo: string;
}

const URL_RE = /^https?:\/\/.+\..+/i;

/**
 * Client-side validation mirroring the server rules, so stations get instant
 * feedback before the request is even sent.
 */
export function validateChannelForm(v: ChannelFormValues): string | null {
  if (v.stationName.trim().length < 2 || v.stationName.trim().length > 80)
    return "Station name must be between 2 and 80 characters.";
  if (v.description.trim().length < 20)
    return "Description must be at least 20 characters so readers know what you broadcast.";
  if (v.description.trim().length > 1000) return "Description must be under 1000 characters.";
  if (v.location.trim().length < 2) return "Location is required (e.g. Kigali, Rwanda).";
  if (!URL_RE.test(v.streamUrl.trim()))
    return "Streaming/website link must be a full URL starting with http:// or https://.";
  if (v.logo && !URL_RE.test(v.logo.trim()))
    return "Logo URL must start with http:// or https:// (or leave it empty).";
  return null;
}

/**
 * Channel registration / edit form.
 *
 * Used both for first-time submission (goes to the administrator review queue)
 * and for editing an approved channel's details afterwards.
 */
export function ChannelForm({
  initial,
  onSubmit,
  submitLabel = "Submit for review",
}: {
  initial?: Channel | null;
  onSubmit: (values: ChannelFormValues) => Promise<void>;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<ChannelFormValues>({
    stationName: initial?.stationName ?? "",
    type: initial?.type ?? "radio",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    streamUrl: initial?.streamUrl ?? "",
    logo: initial?.logo ?? "",
  });
  const [fieldErrors] = useState<Partial<Record<keyof ChannelFormValues, string>>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ChannelFormValues>(key: K, value: ChannelFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const invalid = validateChannelForm(form);
    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        stationName: form.stationName.trim(),
        type: form.type,
        description: form.description.trim(),
        location: form.location.trim(),
        streamUrl: form.streamUrl.trim(),
        logo: form.logo.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
          <Radio className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-lg font-bold">
            {initial ? "Channel details" : "Register your channel"}
          </h2>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {initial
              ? "Update how your station appears on Moon News."
              : "Tell listeners and viewers about your radio or television station. An administrator reviews every submission before it can go live."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Station name *</span>
          <input
            className="input"
            value={form.stationName}
            onChange={(e) => update("stationName", e.target.value)}
            placeholder="e.g. Moon FM 101"
            maxLength={80}
            required
          />
          {fieldErrors.stationName && (
            <span className="mt-1 block text-xs text-red-600">{fieldErrors.stationName}</span>
          )}
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Channel type *</span>
          <select
            className="input"
            value={form.type}
            onChange={(e) => update("type", e.target.value as ChannelType)}
          >
            <option value="radio">📻 Radio</option>
            <option value="television">📺 Television</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-medium">Location *</span>
          <input
            className="input"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Kigali, Rwanda"
            maxLength={80}
            required
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Description * <span className="text-xs font-normal text-[rgb(var(--text-muted))]">({form.description.trim().length}/1000)</span></span>
          <textarea
            className="input min-h-[110px]"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What do you broadcast? Programming, language, audience…"
            maxLength={1000}
            required
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Streaming or website link *</span>
          <input
            className="input"
            type="url"
            value={form.streamUrl}
            onChange={(e) => update("streamUrl", e.target.value)}
            placeholder="https://yourstation.rw/listen"
            required
          />
          <span className="mt-1 block text-xs text-[rgb(var(--text-muted))]">
            A live-stream URL or your station&apos;s website — shown on your channel page.
          </span>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">Logo URL <span className="text-xs font-normal text-[rgb(var(--text-muted))]">(optional)</span></span>
          <input
            className="input"
            type="url"
            value={form.logo}
            onChange={(e) => update("logo", e.target.value)}
            placeholder="https://yourstation.rw/logo.png"
          />
        </label>

        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Submitting…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
