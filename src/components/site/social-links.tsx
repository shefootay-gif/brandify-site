import type { SiteSettings } from "@/content/settings";
import type { Messages } from "@/messages";
import { socialIcons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Props = { social: SiteSettings["social"]; labels: Messages["social"]; className?: string; size?: number };

export function SocialLinks({ social, labels, className, size = 19 }: Props) {
  const items = social.filter((s) => s.visible);
  if (!items.length) return null;
  return (
    <ul className="flex items-center gap-1">
      {items.map((s) => {
        const Icon = socialIcons[s.platform];
        return (
          <li key={s.platform + s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={labels[s.platform]}
              data-track="social"
              data-cta={s.platform}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] transition-colors",
                className,
              )}
            >
              <Icon size={size} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
