import Image from "next/image";
import horizontal from "../../../public/brand/logo-horizontal.png";
import horizontalLight from "../../../public/brand/logo-horizontal-light.png";
import stacked from "../../../public/brand/logo.png";
import stackedLight from "../../../public/brand/logo-light.png";
import type { PublicMedia } from "@/server/db/schema/types";

type Props = {
  variant?: "horizontal" | "stacked";
  tone?: "dark" | "light";
  height: number;
  priority?: boolean;
  className?: string;
  /** Logo uploaded from the dashboard; overrides the built-in asset. */
  custom?: PublicMedia | null;
};

export function Logo({ variant = "horizontal", tone = "dark", height, priority, className, custom }: Props) {
  if (custom?.width && custom.height) {
    const width = Math.round((custom.width / custom.height) * height);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={custom.url} alt="Brandify" width={width} height={height} className={className} />
    );
  }
  const src =
    variant === "horizontal" ? (tone === "light" ? horizontalLight : horizontal) : tone === "light" ? stackedLight : stacked;
  const width = Math.round((src.width / src.height) * height);
  return (
    <Image src={src} alt="Brandify" width={width} height={height} priority={priority} className={className} sizes={`${width}px`} />
  );
}
