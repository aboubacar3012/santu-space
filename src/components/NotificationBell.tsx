"use client";

import Link from "next/link";
import { Bell, Heart, MessageCircle, AtSign } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import { members } from "@/mocks/members";
import { relativeTime } from "@/lib/utils";
import type { AppNotification } from "@/types";

const icons = { reply: MessageCircle, mention: AtSign, like: Heart };

export function NotificationBell({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState(initial);
  const unread = items.filter((item) => !item.read).length;

  async function markAllRead() {
    setItems(await api.markNotificationsRead());
  }

  return (
    <details className="menu notification-menu">
      <summary className="icon-button" aria-label={`${fr.notifications.title}, ${unread} ${fr.notifications.unread}`}>
        <Bell size={20} aria-hidden="true" />
        {unread ? <span className="notification-badge">{unread}</span> : null}
      </summary>
      <div className="menu-popover notification-popover">
        <div className="popover-heading">
          <div><p className="eyebrow">{fr.notifications.title}</p><h2>{unread ? `${unread} ${fr.notifications.unread}` : fr.notifications.allRead}</h2></div>
          <button type="button" onClick={markAllRead}>{fr.actions.markAllRead}</button>
        </div>
        <div className="notification-list">
          {items.map((item) => {
            const actor = members.find((member) => member.id === item.actorId)!;
            const Icon = icons[item.type];
            return (
              <Link key={item.id} href={`/posts/${item.postId}`} className={item.read ? "" : "is-unread"}>
                <span className={`notification-icon notification-${item.type}`}><Icon size={16} /></span>
                <span><strong>{actor.name}</strong> {item.message}<small>{relativeTime(item.createdAt)}</small></span>
                {!item.read ? <i aria-label={fr.notifications.unread} /> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}
