import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  accent = "#4c2fd0",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  delta?: string;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[rgb(var(--text-muted))]">{label}</p>
          <p className="mt-1 font-serif text-3xl font-extrabold">{value}</p>
          {delta && <p className="mt-1 text-xs font-medium text-emerald-600">{delta}</p>}
        </div>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <h3 className="mb-4 font-serif text-base font-bold">{title}</h3>
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    scheduled: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    pending: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  };
  return (
    <span className={`chip shrink-0 ${map[status] ?? "bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]"}`}>
      {status}
    </span>
  );
}
