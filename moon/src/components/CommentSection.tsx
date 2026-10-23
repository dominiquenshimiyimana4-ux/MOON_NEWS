"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Heart, MessageCircle, Trash2 } from "lucide-react";
import type { Article, Comment } from "@/lib/types";
import { commentService } from "@/lib/services/newsService";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CommentSection({ article }: { article: Article }) {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commentService.listForArticle(article.id).then((c) => {
      setComments(c);
      setLoading(false);
    });
  }, [article.id]);

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesFor = (id: string) => comments.filter((c) => c.parentId === id);

  function post(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !draft.trim()) return;
    const c: Comment = {
      id: `local-${Date.now()}`,
      articleId: article.id,
      authorName: user.name,
      authorAvatar: user.avatar ?? `https://i.pravatar.cc/80?u=${user.id}`,
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId: null,
    };
    setComments((prev) => [c, ...prev]);
    setDraft("");
  }

  function postReply(parentId: string) {
    if (!user || !replyDraft.trim()) return;
    const c: Comment = {
      id: `local-${Date.now()}`,
      articleId: article.id,
      authorName: user.name,
      authorAvatar: user.avatar ?? `https://i.pravatar.cc/80?u=${user.id}`,
      content: replyDraft.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      parentId,
    };
    setComments((prev) => [...prev, c]);
    setReplyDraft("");
    setReplyTo(null);
  }

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function remove(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
  }

  return (
    <section id="comments" className="mt-12 border-t border-border pt-8">
      <h2 className="mb-6 flex items-center gap-2 font-serif text-2xl font-extrabold">
        <MessageCircle className="h-6 w-6 text-brand-600" />
        {t("comments.title")}
        <span className="text-base font-medium text-[rgb(var(--text-muted))]">
          ({topLevel.length + comments.filter((c) => c.parentId).length})
        </span>
      </h2>

      {user ? (
        <form onSubmit={post} className="mb-8">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </span>
            <div className="flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder={t("comments.placeholder")}
                className="input resize-y"
              />
              <div className="mt-2 flex justify-end">
                <button type="submit" disabled={!draft.trim()} className="btn-primary">
                  {t("comments.submit")}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-xl border border-border bg-[rgb(var(--bg-subtle))] p-4 text-sm">
          {t("comments.signIn")}{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            {t("nav.login")}
          </Link>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[rgb(var(--text-muted))]">{t("comments.empty")}</p>
      ) : (
        <ul className="space-y-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              locale={locale}
              liked={liked.has(c.id)}
              currentUserName={user?.name}
              onLike={() => toggleLike(c.id)}
              onDelete={() => remove(c.id)}
              onReply={() => setReplyTo(replyTo === c.id ? null : c.id)}
              replies={repliesFor(c.id).map((r) => (
                <CommentItem
                  key={r.id}
                  comment={r}
                  locale={locale}
                  nested
                  liked={liked.has(r.id)}
                  currentUserName={user?.name}
                  onLike={() => toggleLike(r.id)}
                  onDelete={() => remove(r.id)}
                />
              ))}
              replyBox={
                replyTo === c.id && user ? (
                  <div className="mt-3">
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      rows={2}
                      placeholder={t("comments.placeholder")}
                      className="input resize-y"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button type="button" onClick={() => setReplyTo(null)} className="btn-ghost text-sm">
                        {t("common.cancel")}
                      </button>
                      <button type="button" onClick={() => postReply(c.id)} disabled={!replyDraft.trim()} className="btn-primary text-sm">
                        {t("comments.reply")}
                      </button>
                    </div>
                  </div>
                ) : null
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface CommentItemProps {
  comment: Comment;
  locale: "rw" | "en";
  nested?: boolean;
  liked?: boolean;
  currentUserName?: string;
  onLike: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  replies?: React.ReactNode;
  replyBox?: React.ReactNode;
}

function CommentItem({
  comment,
  locale,
  nested,
  liked = false,
  currentUserName,
  onLike,
  onDelete,
  onReply,
  replies,
  replyBox,
}: CommentItemProps) {
  const { t } = useLanguage();
  const isOwn = currentUserName && currentUserName === comment.authorName;

  return (
    <li className={cn(nested && "mt-4 ml-10 border-l-2 border-border pl-4")}>
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgb(var(--bg-subtle))] text-sm font-bold text-[rgb(var(--text-muted))]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={comment.authorAvatar} alt={comment.authorName} className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{comment.authorName}</span>
            <span className="text-xs text-[rgb(var(--text-muted))]">{timeAgo(comment.createdAt, locale)}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--text-muted))]">
            <button type="button" onClick={onLike} className={cn("inline-flex items-center gap-1 hover:text-brand-600", liked && "text-brand-600")}>
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} /> {comment.likes}
            </button>
            {onReply && (
              <button type="button" onClick={onReply} className="inline-flex items-center gap-1 hover:text-brand-600">
                <MessageCircle className="h-3.5 w-3.5" /> {t("comments.reply")}
              </button>
            )}
            <button
              type="button"
              onClick={() => alert(locale === "rw" ? "Ikirego cyoherejwe." : "Report submitted.")}
              className="inline-flex items-center gap-1 hover:text-red-500"
            >
              <Flag className="h-3.5 w-3.5" /> {t("comments.report")}
            </button>
            {isOwn && onDelete && (
              <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" /> {t("comments.delete")}
              </button>
            )}
          </div>
          {replyBox}
          {replies && <ul>{replies}</ul>}
        </div>
      </div>
    </li>
  );
}

export default CommentSection;
