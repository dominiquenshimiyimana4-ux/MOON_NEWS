import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10">
        <FileQuestion className="h-10 w-10" />
      </span>
      <p className="font-serif text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 font-serif text-3xl font-extrabold">Page Not Found</h1>
      <p className="mt-2 max-w-md text-sm text-[rgb(var(--text-muted))]">
        The story you&apos;re looking for could not be found. It may have been moved or removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/search" className="btn-outline">Search news</Link>
      </div>
    </div>
  );
}
