"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ToastProvider } from "@/components/Toast";
import { fr } from "@/i18n/fr";

export function AppShell({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <ToastProvider>
      {!online ? <div className="offline-banner" role="status"><WifiOff size={16} />{fr.community.offline}</div> : null}
      <AppHeader />
      <main className="page-shell">{children}</main>
    </ToastProvider>
  );
}
