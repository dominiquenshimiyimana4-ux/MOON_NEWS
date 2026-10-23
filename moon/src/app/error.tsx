"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to your error-tracking service.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
        <AlertTriangle className="h-10 w-10" />
      </span>
      <h1 className="font-serif text-3xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-[rgb(var(--text-muted))]">
        We hit an unexpected error while loading this page. Please try again.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-[rgb(var(--text-muted))]">Error reference: {error.digest}</p>
      )}
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
