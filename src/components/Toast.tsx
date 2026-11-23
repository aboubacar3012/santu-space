"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { fr } from "@/i18n/fr";

type ToastValue = { showToast: (message: string) => void };
const ToastContext = createContext<ToastValue>({ showToast: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const showToast = useCallback((next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage(""), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div className="toast" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} aria-label={fr.actions.close}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function Toast() {
  return null;
}
