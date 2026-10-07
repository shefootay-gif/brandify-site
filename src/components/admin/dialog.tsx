"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Native <dialog> wrapper: focus trapping, Escape and backdrop click for free. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  variant = "modal",
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "modal" | "drawer";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cn(
        "m-0 bg-transparent p-0 backdrop:bg-navy-950/50 backdrop:backdrop-blur-[2px]",
        variant === "drawer"
          ? "ms-auto h-dvh max-h-dvh w-full max-w-2xl"
          : cn("mx-auto my-auto max-h-[90dvh] w-[calc(100%-2rem)]", widths[size]),
      )}
    >
      {open && (
        <div
          className={cn(
            "flex max-h-[inherit] flex-col bg-white text-ink-900",
            variant === "drawer" ? "h-dvh" : "rounded-[var(--radius-lg)] shadow-[var(--shadow-lift)]",
          )}
        >
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
            <h2 className="text-lg font-bold text-navy-900">{title}</h2>
            <button type="button" onClick={onClose} aria-label="إغلاق" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-paper-2">
              <CloseIcon size={20} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
          {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4 md:px-6">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}

type ConfirmOptions = { title: string; body?: string; confirmLabel?: string; danger?: boolean };
const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), []);
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={Boolean(state)}
        onClose={() => close(false)}
        title={state?.title ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="subtle" onClick={() => close(false)}>
              إلغاء
            </Button>
            <Button variant={state?.danger ? "danger" : "secondary"} onClick={() => close(true)} autoFocus>
              {state?.confirmLabel ?? "تأكيد"}
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          {state?.danger && <AlertIcon size={22} className="mt-0.5 shrink-0 text-danger" />}
          <p className="text-ink-600">{state?.body}</p>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
