import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Mail, Twitter } from "lucide-react";
import type { Author } from "@/lib/types";

export function AuthorCard({ author, articleCount }: { author: Author; articleCount?: number }) {
  return (
    <Link href={`/authors/${author.slug}`} className="group card flex flex-col items-center p-6 text-center transition-shadow hover:shadow-card-hover">
      <span className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-brand-500/20">
        <Image src={author.avatar} alt={author.name} fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      </span>
      <h3 className="mt-3 font-serif text-lg font-bold transition-colors group-hover:text-brand-600">{author.name}</h3>
      <p className="text-sm text-[rgb(var(--text-muted))]">{author.position}</p>
      {typeof articleCount === "number" && (
        <p className="mt-1 text-xs font-medium text-brand-600">{articleCount} articles</p>
      )}
      <div className="mt-4 flex items-center gap-2">
        {author.social.twitter && <SocialIcon href={author.social.twitter} label="X" icon={<Twitter className="h-4 w-4" />} />}
        {author.social.facebook && <SocialIcon href={author.social.facebook} label="Facebook" icon={<Facebook className="h-4 w-4" />} />}
        {author.social.linkedin && <SocialIcon href={author.social.linkedin} label="LinkedIn" icon={<Linkedin className="h-4 w-4" />} />}
        {author.social.email && <SocialIcon href={`mailto:${author.social.email}`} label="Email" icon={<Mail className="h-4 w-4" />} />}
      </div>
    </Link>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  // Rendered inside the author card's <Link>; kept non-interactive to avoid
  // nesting anchors. Icons are decorative and the whole card links to the profile.
  return (
    <span
      title={`${label}: ${href}`}
      aria-label={label}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border text-[rgb(var(--text-muted))] transition-colors group-hover:border-brand-500 group-hover:text-brand-600"
    >
      {icon}
    </span>
  );
}

export default AuthorCard;
