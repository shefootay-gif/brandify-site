import type { ComponentProps } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { buttonClasses } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/icons";

type Props = Omit<ComponentProps<"a">, "href"> & {
  number: string;
  message: string;
  /** Identifies which CTA was used (tracked in analytics + lead source). */
  cta: string;
  label: string;
  variant?: "primary" | "secondary" | "light" | "outline-light";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  showIcon?: boolean;
};

/** Opens a WhatsApp chat with a pre-filled, context-specific message. */
export function WhatsAppLink({
  number,
  message,
  cta,
  label,
  variant = "primary",
  size = "md",
  magnetic,
  showIcon = true,
  className,
  ...rest
}: Props) {
  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp"
      data-cta={cta}
      data-magnetic={magnetic ? "" : undefined}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {showIcon && <WhatsAppIcon size={size === "lg" ? 22 : 19} />}
      <span>{label}</span>
    </a>
  );
}
