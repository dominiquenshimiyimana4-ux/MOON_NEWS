import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  compact?: boolean;
}

/**
 * Moon News brand mark: a glowing crescent moon over a midnight-indigo disc,
 * with golden "newswire" broadcast arcs in the negative space.
 * Original artwork — not derived from any existing news organisation.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={cn("h-9 w-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="mn-sky" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3d2f9e" />
          <stop offset="45%" stopColor="#2b2a86" />
          <stop offset="100%" stopColor="#141436" />
        </linearGradient>
        <linearGradient id="mn-moon" x1="18" y1="12" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="55%" stopColor="#f6c453" />
          <stop offset="100%" stopColor="#e29427" />
        </linearGradient>
        <linearGradient id="mn-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd977" />
          <stop offset="100%" stopColor="#e29427" />
        </linearGradient>
        <radialGradient id="mn-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffd977" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd977" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* midnight disc */}
      <circle cx="32" cy="32" r="30" fill="url(#mn-sky)" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#mn-gold)" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* soft moonlight glow behind the crescent */}
      <circle cx="31" cy="28" r="17" fill="url(#mn-glow)" />

      {/* crescent moon */}
      <path
        d="M38.5 13.5a19.5 19.5 0 1 0 0 37 15.5 15.5 0 1 1 0-37z"
        fill="url(#mn-moon)"
      />
      {/* craters */}
      <circle cx="26" cy="27" r="3.1" fill="#c9821f" opacity="0.45" />
      <circle cx="33" cy="35" r="2" fill="#c9821f" opacity="0.35" />
      <circle cx="24" cy="37" r="1.3" fill="#c9821f" opacity="0.3" />

      {/* stars */}
      <circle cx="18" cy="18" r="1.7" fill="#fff7e0" />
      <circle cx="46" cy="16" r="1.1" fill="#fff7e0" opacity="0.85" />
      <circle cx="45" cy="49" r="1.5" fill="#fff7e0" opacity="0.9" />

      {/* newswire broadcast arcs */}
      <path d="M24 46a9 9 0 0 1 9-4.5" stroke="url(#mn-gold)" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M24 52a16 16 0 0 1 16-8"
        stroke="url(#mn-gold)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M24 58a23 23 0 0 1 23-11.5"
        stroke="url(#mn-gold)"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="22" cy="46" r="3" fill="url(#mn-gold)" />
    </svg>
  );
}

export function Logo({ className, showTagline = false, compact = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={compact ? "h-8 w-8" : "h-9 w-9 shrink-0"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif font-extrabold tracking-tight text-[rgb(var(--text))]",
            compact ? "text-lg" : "text-xl sm:text-[1.4rem]"
          )}
        >
          Moon<span className="text-brand-600"> News</span>
        </span>
        {showTagline && (
          <span className="mt-0.5 hidden text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[rgb(var(--text-muted))] sm:block">
            Amakuru y&apos;ukuri, ku gihe
          </span>
        )}
      </span>
    </span>
  );
}

export default Logo;
