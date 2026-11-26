"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.durationMs || 4000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const iconMap = {
            success: <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />,
            warning: <AlertTriangle className="w-4 h-4 text-amber flex-shrink-0" />,
            error: <XCircle className="w-4 h-4 text-crimson flex-shrink-0" />,
            info: <Info className="w-4 h-4 text-forest flex-shrink-0" />,
          };

          const bgMap = {
            success: "bg-white border-emerald/30",
            warning: "bg-white border-amber/30",
            error: "bg-white border-crimson/30",
            info: "bg-white border-gray-200",
          };

          return (
            <div
              key={t.id}
              className={`p-3.5 rounded-2xl shadow-elevation border ${bgMap[t.type]} flex items-start gap-3 pointer-events-auto transition-all animate-in slide-in-from-bottom-2`}
            >
              {iconMap[t.type]}
              <div className="flex-1 text-xs">
                <div className="font-semibold text-forest text-xs">{t.title}</div>
                {t.message && <p className="text-charcoal-muted mt-0.5">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg hover:bg-gray-100 text-charcoal-muted"
              >
                <X className="w-3.5 h-3.5" />
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
  if (!ctx) {
    // Return fallback noop if outside provider
    return {
      showToast: (t: Omit<ToastMessage, "id">) => {
        console.log("Toast:", t.title, t.message);
      },
    };
  }
  return ctx;
}
