import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-[var(--ease-brand)] " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Orange with navy text: 5.9:1 contrast (white on orange fails AA).
  primary: "bg-orange-500 text-navy-950 hover:bg-orange-600 shape-bubble",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 shape-bubble",
  ghost: "text-navy-900 hover:bg-navy-50 rounded-[var(--radius-md)]",
  light: "bg-white text-navy-900 hover:bg-paper-2 shape-bubble",
  "outline-light": "border border-white/30 text-white hover:border-white hover:bg-white/5 shape-bubble",
  danger: "bg-danger text-white hover:brightness-110 rounded-[var(--radius-md)]",
  subtle: "border border-line bg-white text-navy-900 hover:border-navy-600/40 rounded-[var(--radius-md)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
