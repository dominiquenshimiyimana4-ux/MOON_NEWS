"use client";

import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks/BookmarkProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SaveButtonProps {
  slug: string;
  className?: string;
  showLabel?: boolean;
  savedLabel?: string;
  label?: string;
}

export function SaveButton({ slug, className, showLabel, savedLabel = "Saved", label = "Save" }: SaveButtonProps) {
  const { isSaved, toggle, hydrated } = useBookmarks();
  const { user } = useAuth();
  const router = useRouter();
  const [justSaved, setJustSaved] = useState(false);
  const saved = hydrated && isSaved(slug);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const now = toggle(slug);
    if (now) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1200);
    }
    if (!user) {
      // Saving works locally; nudge to account for cross-device sync.
      router.push("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? savedLabel : label}
      title={saved ? savedLabel : label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full p-2 transition-colors",
        saved ? "text-brand-600" : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]",
        className
      )}
    >
      <Bookmark className={cn("h-[18px] w-[18px]", saved && "fill-current", justSaved && "animate-bounce")} />
      {showLabel && <span className="text-sm font-medium">{saved ? savedLabel : label}</span>}
    </button>
  );
}

export default SaveButton;
