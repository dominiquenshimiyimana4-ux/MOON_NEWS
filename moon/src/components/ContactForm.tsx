"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    // No backend yet: simulate a successful send. Wire to POST /api/contact later.
    await new Promise((r) => setTimeout(r, 700));
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
  }

  if (status === "sent") {
    return (
      <div className="card flex flex-col items-center p-8 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="font-serif text-xl font-bold">Message sent</h3>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
          Thank you for contacting Moon News. We&apos;ll get back to you shortly.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn-outline mt-5">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Name</label>
          <input id="c-name" required value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="c-email">Email</label>
          <input id="c-email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-subject">Subject</label>
        <input id="c-subject" required value={form.subject} onChange={(e) => update("subject", e.target.value)} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="c-message">Message</label>
        <textarea id="c-message" required rows={5} value={form.message} onChange={(e) => update("message", e.target.value)} className="input resize-y" />
      </div>
      <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
        {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send message
      </button>
    </form>
  );
}

export default ContactForm;
