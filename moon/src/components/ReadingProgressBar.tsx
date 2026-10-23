"use client";

import { useEffect, useState } from "react";

/** Fixed progress bar that tracks how far the reader has scrolled. */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const value = total > 0 ? (el.scrollTop / total) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, value)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ReadingProgressBar;
