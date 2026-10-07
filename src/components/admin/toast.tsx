"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; message: string };

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => {
          const Icon = t.tone === "success" ? CheckIcon : t.tone === "error" ? AlertIcon : InfoIcon;
          return (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium shadow-[var(--shadow-lift)]",
                t.tone === "success" && "bg-navy-900 text-white",
                t.tone === "error" && "bg-danger text-white",
                t.tone === "info" && "bg-white text-navy-900 ring-1 ring-line",
              )}
            >
              <Icon size={18} className={t.tone === "success" ? "text-orange-500" : undefined} />
              <span className="flex-1">{t.message}</span>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="إغلاق" className="opacity-70 hover:opacity-100">
                <CloseIcon size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
