import { MapPin, Settings, Users, Wifi } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fr } from "@/i18n/fr";
import type { Community, Member } from "@/types";

export function CommunitySidebarCard({ community, user }: { community: Community; user: Member }) {
  return (
    <Card className="community-sidebar-card">
      <div className="community-banner"><span>{community.bannerLabel}</span></div>
      <div className="sidebar-body">
        <div className="community-mini-logo">{community.shortName}</div>
        <h2>{community.name}</h2>
        <p className="community-location"><MapPin size={14} />{community.city}</p>
        <p>{community.description}</p>
        <div className="community-stats">
          <span><strong>{community.memberCount.toLocaleString("fr-FR")}</strong><small><Users size={13} />{fr.community.members}</small></span>
          <span><strong>{community.onlineCount}</strong><small><Wifi size={13} />{fr.community.online}</small></span>
          <span><strong>2</strong><small>{fr.community.admins}</small></span>
        </div>
        {user.role === "admin" ? <Link className="sidebar-settings button button-secondary" href="/settings"><Settings size={16} />{fr.community.settings}</Link> : null}
      </div>
    </Card>
  );
}
