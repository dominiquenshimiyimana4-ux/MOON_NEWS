"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  PlusCircle,
  Radio,
  ShieldAlert,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { AdminProvider } from "@/lib/admin/AdminProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { canAccessAdmin, roleLabels } from "@/lib/services/authService";
import { cn } from "@/lib/utils";

const navGroups: { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/articles", label: "Manage News", icon: FileText },
      { href: "/admin/users", label: "Manage Users", icon: Users },
      { href: "/admin/comments", label: "Manage Feedback", icon: MessageSquare },
      { href: "/admin/media", label: "Manage Media", icon: ImageIcon },
      { href: "/admin/breaking", label: "Breaking News", icon: Radio },
      { href: "/admin/live-requests", label: "Live Requests", icon: Radio },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/admin/analytics", label: "Visitor Analytics", icon: BarChart3 }],
  },
  {
    label: "Monetization",
    items: [
      { href: "/admin/advertising", label: "Advertiser Dashboard", icon: Megaphone },
      { href: "/admin/ad-review", label: "Ad Review", icon: Megaphone },
      { href: "/admin/revenue", label: "Advertising Revenue", icon: BarChart3 },
    ],
  },
  {
    label: "Create",
    items: [{ href: "/admin/articles/new", label: "New Article", icon: PlusCircle }],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (hydrated && !canAccessAdmin(user)) {
    return (
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <h1 className="font-serif text-2xl font-extrabold">Admin access required</h1>
        <p className="mt-2 max-w-sm text-sm text-[rgb(var(--text-muted))]">
          This area is restricted to administrators, editors and journalists. Please log in with a
          staff account.
        </p>
        <Link href="/login" className="btn-primary mt-6">Go to login</Link>
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <AdminProvider>
      <div className="min-h-[calc(100vh-4rem)] bg-[rgb(var(--bg-subtle))] lg:flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-border bg-[rgb(var(--surface))] transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link href="/admin" className="flex items-center gap-2 font-serif text-lg font-extrabold">
              <span className="text-brand-600">Admin</span> Panel
            </Link>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost h-8 w-8 rounded-lg !px-0 lg:hidden" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-3">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href, item.exact)
                        ? "bg-brand-600 text-white"
                        : "text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-subtle))] hover:text-[rgb(var(--text))]"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
            {user && (
              <div className="mb-2 flex items-center gap-3 px-2">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{user.name}</span>
                  <span className="block text-xs text-[rgb(var(--text-muted))]">{roleLabels[user.role]}</span>
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <Link href="/" className="btn-outline flex-1 text-xs">
                <ExternalLink className="h-3.5 w-3.5" /> View site
              </Link>
              <button type="button" onClick={logout} className="btn-ghost !px-2 text-red-600" aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
        )}

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex h-14 items-center gap-3 border-b border-border bg-[rgb(var(--surface))] px-4 lg:hidden">
            <button type="button" onClick={() => setOpen(true)} className="btn-ghost h-9 w-9 rounded-lg !px-0" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo compact />
          </div>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </AdminProvider>
  );
}
