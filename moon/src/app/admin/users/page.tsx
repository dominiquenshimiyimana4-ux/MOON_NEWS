"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Pencil, Plus, Search, Shield, Trash2, UserPlus, X } from "lucide-react";
import type { User, UserRole } from "@/lib/types";
import { users as seedUsers, subscribers } from "@/lib/data/admin";
import { roleLabels } from "@/lib/services/authService";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/StatCard";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";

const USERS_KEY = "moon_news_admin_users";
const ROLES: UserRole[] = ["admin", "editor", "journalist", "reader", "advertiser"];

const roleStyles: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  editor: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  journalist: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  reader: "bg-[rgb(var(--bg-subtle))] text-[rgb(var(--text-muted))]",
  advertiser: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
};

function loadUsers(): User[] {
  if (typeof window === "undefined") return seedUsers;
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : seedUsers;
  } catch {
    return seedUsers;
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);

  // hydrate from localStorage once on mount
  useEffect(() => {
    setUsers(loadUsers());
    setHydrated(true);
  }, []);

  const persist = (next: User[]) => {
    setUsers(next);
    window.localStorage.setItem(USERS_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (role !== "all" && u.role !== role) return false;
        if (
          query &&
          !u.name.toLowerCase().includes(query.toLowerCase()) &&
          !u.email.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [users, query, role]
  );

  const changeRole = (id: string, nextRole: UserRole) =>
    persist(users.map((u) => (u.id === id ? { ...u, role: nextRole } : u)));

  const removeUser = (id: string) => persist(users.filter((u) => u.id !== id));

  const saveUser = (u: User) => {
    const exists = users.some((x) => x.id === u.id);
    persist(exists ? users.map((x) => (x.id === u.id ? u : x)) : [u, ...users]);
    setEditing(null);
    setAdding(false);
  };

  return (
    <div>
      <PageHeader
        title="Manage Users"
        subtitle={`${users.length} registered · ${subscribers.length} newsletter subscribers`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users…"
                className="input !pl-9"
              />
            </div>
            <button type="button" onClick={() => setAdding(true)} className="btn-primary shrink-0">
              <UserPlus className="h-4 w-4" /> Add user
            </button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", ...ROLES] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`chip border transition-colors ${
              role === r
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]"
            }`}
          >
            {r === "all" ? "All roles" : roleLabels[r as UserRole]}
          </button>
        ))}
      </div>

      {!hydrated ? (
        <div className="text-sm text-[rgb(var(--text-muted))]">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your filters." />
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-[rgb(var(--border))]">
            {filtered.map((u) => (
              <li key={u.id} className="flex items-center gap-4 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700">
                  {u.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    u.name.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-[rgb(var(--text-muted))]">
                    <Mail className="h-3 w-3" /> {u.email}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-xs text-[rgb(var(--text-muted))]">Joined</p>
                  <p className="text-xs font-medium">{formatDate(u.createdAt, "en")}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                  className={`chip shrink-0 cursor-pointer border-0 font-semibold ${roleStyles[u.role]}`}
                  aria-label={`Role for ${u.name}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {roleLabels[r]}
                    </option>
                  ))}
                </select>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(u)}
                    className="btn-ghost h-8 w-8 rounded-lg !px-0"
                    aria-label="Edit user"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(u.id)}
                    className="btn-ghost h-8 w-8 rounded-lg !px-0 text-red-600"
                    aria-label="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card mt-6 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-serif text-base font-bold">
          <Shield className="h-4 w-4 text-brand-600" /> Newsletter subscribers
        </h3>
        <ul className="divide-y divide-[rgb(var(--border))]">
          {subscribers.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="flex items-center gap-2 text-[rgb(var(--text))]">
                <Mail className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" /> {s.email}
              </span>
              <span className="text-xs text-[rgb(var(--text-muted))]">{formatDate(s.createdAt, "en")}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
        User management is stored locally for the demo. Connect <code>GET/POST /api/users</code> to persist.
      </p>

      {(editing || adding) && (
        <UserForm
          user={editing}
          onCancel={() => {
            setEditing(null);
            setAdding(false);
          }}
          onSave={saveUser}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete user?"
          message="This removes the user from the demo directory. This action cannot be undone."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeUser(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}

function UserForm({
  user,
  onCancel,
  onSave,
}: {
  user: User | null;
  onCancel: () => void;
  onSave: (u: User) => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "reader");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({
      id: user?.id ?? `u-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: avatar.trim() || undefined,
      createdAt: user?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} aria-hidden />
      <form onSubmit={submit} className="card relative w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">{user ? "Edit user" : "Add user"}</h3>
          <button type="button" onClick={onCancel} className="btn-ghost h-8 w-8 rounded-lg !px-0" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label" htmlFor="u-name">Name</label>
            <input id="u-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="u-email">Email</label>
            <input id="u-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="u-role">Role</label>
            <select id="u-role" className="input" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="u-avatar">Avatar URL (optional)</label>
            <input id="u-avatar" className="input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" /> {user ? "Save changes" : "Add user"}
          </button>
        </div>
      </form>
    </div>
  );
}
