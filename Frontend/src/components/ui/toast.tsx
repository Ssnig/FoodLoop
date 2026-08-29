import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  pushToast: (input: { title: string; description?: string; tone?: ToastTone }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (input: { title: string; description?: string; tone?: ToastTone }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const toast: ToastMessage = {
        id,
        title: input.title,
        description: input.description,
        tone: input.tone ?? "success"
      };
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100vw-2rem,22rem)] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={
              toast.tone === "error"
                ? "pointer-events-auto rounded-2xl border border-destructive/30 bg-card px-4 py-3 text-sm shadow-xl shadow-destructive/10"
                : toast.tone === "info"
                  ? "pointer-events-auto rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-xl"
                  : "pointer-events-auto rounded-2xl border border-primary/20 bg-card px-4 py-3 text-sm shadow-xl shadow-primary/10"
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-muted-foreground">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                onClick={() => dismissToast(toast.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
