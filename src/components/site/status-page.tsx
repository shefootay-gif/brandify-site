import type { ReactNode } from "react";
import { BubbleOutline } from "./section";

/** Shared layout for 404 / error / unauthorized states. */
export function StatusPage({ code, title, body, actions }: { code: string; title: string; body: string; actions: ReactNode }) {
  return (
    <section data-surface="dark" className="relative flex min-h-[85svh] items-center overflow-hidden bg-navy-900 text-white">
      <BubbleOutline className="pointer-events-none absolute -end-20 top-1/2 w-[34rem] -translate-y-1/2 text-navy-800" />
      <div className="container-x relative pt-[var(--header-h)]">
        <p className="t-latin text-[clamp(6rem,20vw,14rem)] font-extrabold leading-none text-orange-500">{code}</p>
        <h1 className="t-h1 mt-4 max-w-2xl">{title}</h1>
        <p className="mt-5 max-w-xl text-lg text-white/70">{body}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">{actions}</div>
      </div>
    </section>
  );
}
