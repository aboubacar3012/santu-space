"use client";

import { Bell, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { api } from "@/lib/api";
import type { AppNotification } from "@/types";
import { fr } from "@/i18n/fr";
import { CommunityBrand } from "@/components/CommunityBrand";
import { SearchBar } from "@/components/SearchBar";
import { NotificationBell } from "@/components/NotificationBell";
import { UserMenu } from "@/components/UserMenu";
import { TabsNav } from "@/components/TabsNav";

export function AppHeader() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    void api.getNotifications().then(setNotifications);
  }, []);

  return (
    <header className="app-header">
      <div className="header-main">
        <CommunityBrand />
        <SearchBar />
        <div className="header-actions">
          <button
            type="button"
            className="icon-button messages-disabled"
            disabled
            aria-label={fr.messages}
          >
            <MessageCircle size={20} />
            <span>{fr.community.soon}</span>
          </button>
          {notifications.length ? (
            <NotificationBell initial={notifications} />
          ) : (
            <span className="icon-button skeleton-notification" aria-label={fr.state.loading}>
              <Bell size={20} />
            </span>
          )}
          <UserMenu />
        </div>
      </div>
      <div className="header-tabs">
        <Suspense
          fallback={<nav className="tabs-nav tabs-loading" aria-label={fr.state.loading} />}
        >
          <TabsNav />
        </Suspense>
      </div>
    </header>
  );
}
