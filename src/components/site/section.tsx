import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2";
  className?: string;
  action?: ReactNode;
};

/** Consistent section heading: eyebrow, title, optional subtitle and action. */
export function SectionHeading({ eyebrow, title, subtitle, align = "start", tone = "light", as = "h2", className, action }: HeadingProps) {
  const Tag = as;
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")} data-reveal>
        {eyebrow && (
          <p className={cn("t-eyebrow mb-4 flex items-center gap-3", tone === "dark" ? "text-orange-500" : "text-orange-700", align === "center" && "justify-center")}>
            <span aria-hidden="true" className="h-0.5 w-6 bg-current" />
            {eyebrow}
          </p>
        )}
        <Tag className={cn(as === "h1" ? "t-h1" : "t-h2", tone === "dark" ? "text-white" : "text-navy-900")}>{title}</Tag>
        {subtitle && (
          <p className={cn("mt-5 max-w-2xl", tone === "dark" ? "text-white/70" : "text-ink-600", align === "center" && "mx-auto")}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0" data-reveal>{action}</div>}
    </div>
  );
}

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

/** Navy band at the top of inner pages (sits under the fixed header). */
export function PageHero({ eyebrow, title, subtitle, children, className }: PageHeroProps) {
  return (
    <section data-surface="dark" className={cn("relative overflow-hidden bg-navy-900 text-white", className)}>
      <BubbleOutline className="pointer-events-none absolute -end-24 -bottom-40 w-[28rem] text-navy-800 md:w-[38rem]" />
      <div className="container-x relative pt-[calc(var(--header-h)+3.5rem)] pb-16 md:pt-[calc(var(--header-h)+6rem)] md:pb-24">
        <div className="max-w-4xl">
          {eyebrow && (
            <p className="hero-in t-eyebrow mb-5 flex items-center gap-3 text-orange-500">
              <span aria-hidden="true" className="h-0.5 w-6 bg-current" />
              {eyebrow}
            </p>
          )}
          {/* Above the fold: CSS-only entrance (no JS needed, no LCP delay). */}
          <h1 className="hero-in t-h1 text-white" style={{ ["--i" as string]: 1 }}>
            {title}
          </h1>
          {subtitle && (
            <p className="hero-in mt-6 max-w-2xl text-lg text-white/70" style={{ ["--i" as string]: 2 }}>
              {subtitle}
            </p>
          )}
          {children && (
            <div className="hero-in mt-9" style={{ ["--i" as string]: 3 }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Oversized speech-bubble outline used as a quiet background motif. */
export function BubbleOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}>
      <path
        d="M70 30h200a90 90 0 0 1 90 90v80a90 90 0 0 1-90 90H150l-80 80v-82a50 50 0 0 1-40-49V70a40 40 0 0 1 40-40Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
