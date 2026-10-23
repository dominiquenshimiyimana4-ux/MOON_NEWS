import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-[rgb(var(--bg-subtle))] px-6 py-16 text-center", className)}>
      {icon && <div className="mb-4 text-[rgb(var(--text-muted))]">{icon}</div>}
      <h3 className="font-serif text-xl font-bold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-[rgb(var(--text-muted))]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
