"use client";

import Link from "next/link";
import { Bell, Heart, MessageCircle, AtSign } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import { members } from "@/mocks/members";
import { relativeTime } from "@/lib/utils";
import { focusPost } from "@/lib/focus-post";
import type { AppNotification } from "@/types";

const icons = { reply: MessageCircle, mention: AtSign, like: Heart };

export function NotificationBell({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState(initial);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const router = useRouter();
  const unread = items.filter((item) => !item.read).length;

  async function markAllRead() {
    setItems(await api.markNotificationsRead());
  }

  // Mène au post dans le fil (sans ouvrir de nouvelle page) et ouvre ses commentaires si besoin
  function open(event: MouseEvent, item: AppNotification) {
    event.preventDefault();
    menuRef.current?.removeAttribute("open");
    setItems((list) =>
      list.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)),
    );
    focusPost.request(item.postId, item.type !== "like");
    if (window.location.pathname !== "/") router.push("/");
  }

  return (
    <details ref={menuRef} className="menu notification-menu">
      <summary
        className="icon-button"
        aria-label={`${fr.notifications.title}, ${unread} ${fr.notifications.unread}`}
      >
        <Bell size={20} aria-hidden="true" />
        {unread ? <span className="notification-badge">{unread}</span> : null}
      </summary>
      <div className="menu-popover notification-popover">
        <div className="popover-heading">
          <div>
            <p className="eyebrow">{fr.notifications.title}</p>
            <h2>{unread ? `${unread} ${fr.notifications.unread}` : fr.notifications.allRead}</h2>
          </div>
          <button type="button" onClick={markAllRead}>
            {fr.actions.markAllRead}
          </button>
        </div>
        <div className="notification-list">
          {items.map((item) => {
            const actor = members.find((member) => member.id === item.actorId)!;
            const Icon = icons[item.type];
            return (
              <Link
                key={item.id}
                href="/"
                onClick={(event) => open(event, item)}
                className={item.read ? "" : "is-unread"}
              >
                <span className={`notification-icon notification-${item.type}`}>
                  <Icon size={16} />
                </span>
                <span>
                  <strong>{actor.name}</strong> {item.message}
                  <small>{relativeTime(item.createdAt)}</small>
                </span>
                {!item.read ? <i aria-label={fr.notifications.unread} /> : null}
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}
