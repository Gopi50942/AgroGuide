"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

type ToastKind = "success" | "info" | "warning" | "error";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastKind, React.ElementType> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: TriangleAlert,
};

const STYLES: Record<ToastKind, string> = {
  success: "bg-forest-700 text-cream-50",
  info: "bg-ink text-cream-50",
  warning: "bg-clay-500 text-cream-50",
  error: "bg-rust-700 text-cream-50",
};

const MAX_VISIBLE_TOASTS = 3;
const DEDUPLICATION_WINDOW_MS = 2000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback((message: string, kind: ToastKind = "info") => {
    if (!message || typeof message !== "string") return;

    const key = `${kind}:${message.trim()}`;
    const now = Date.now();
    const lastShown = recentToastsRef.current.get(key);

    // Suppress duplicate identical toast within 2 seconds
    if (lastShown && now - lastShown < DEDUPLICATION_WINDOW_MS) {
      return;
    }

    recentToastsRef.current.set(key, now);
    const id = now + Math.random();

    setToasts((prev) => {
      const updated = [...prev, { id, message, kind }];
      if (updated.length > MAX_VISIBLE_TOASTS) {
        return updated.slice(updated.length - MAX_VISIBLE_TOASTS);
      }
      return updated;
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      // Cleanup old cache entries
      recentToastsRef.current.delete(key);
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-soft animate-fade-up ${STYLES[t.kind]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-snug">{t.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-auto shrink-0 opacity-70 hover:opacity-100"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
