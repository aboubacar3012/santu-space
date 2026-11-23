"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Compass, Home, Plus, Search, Settings2, School, Sparkles } from "lucide-react";
import { community, relatedSpaces } from "@/mocks/community";
import { fr } from "@/i18n/fr";

const spaces = [
  { id: "santu-lycee", name: community.name, detail: community.city, mark: community.shortName, color: "green", current: true, href: "/" },
  ...relatedSpaces,
];

export function CommunitySwitcher() {
  const [query, setQuery] = useState("");
  const visibleSpaces = spaces.filter((space) => `${space.name} ${space.detail}`.toLowerCase().includes(query.toLowerCase().trim()));

  return (
    <details className="menu community-switcher">
      <summary className="community-switcher-trigger" aria-label={fr.community.switch}>
        <span className="brand-mark"><School size={21} strokeWidth={2.2} /></span>
        <span className="brand-copy">
          <strong>{fr.brand}</strong>
          <span>{community.name}</span>
        </span>
        <span className="switch-chevron"><ChevronDown size={17} aria-hidden="true" /></span>
      </summary>
      <div className="menu-popover community-switcher-popover">
        <div className="switcher-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={fr.community.findSpace} aria-label={fr.community.findSpace} autoComplete="off" />
          <Link href="/settings" aria-label={fr.community.settings}><Settings2 size={18} /></Link>
        </div>

        <div className="switcher-quick-actions">
          <Link href="/"><span><Home size={18} /></span>{fr.community.globalFeed}</Link>
          <Link href="/members"><span><Compass size={18} /></span>{fr.community.discoverSpaces}</Link>
          <Link href="/settings"><span><Plus size={18} /></span>{fr.community.createSpace}</Link>
        </div>

        <div className="switcher-section-title"><span>{fr.community.mySpaces}</span><span>{spaces.length}</span></div>
        <div className="switcher-spaces">
          {visibleSpaces.map((space) => (
            <Link key={space.id} href={space.href} className={space.current ? "current" : undefined}>
              <span className={`space-logo space-logo-${space.color}`}>{space.id === "santu-lycee" ? <School size={21} /> : space.mark}</span>
              <span className="space-copy"><strong>{space.name}</strong><small>{space.detail}</small></span>
              {space.current ? <span className="space-current"><Check size={13} />{fr.community.current}</span> : <Sparkles size={15} className="space-sparkle" />}
            </Link>
          ))}
          {!visibleSpaces.length ? <p className="switcher-empty">{fr.community.noSpaces}</p> : null}
        </div>
        <div className="menu-note"><School size={14} />{fr.brand} · {community.city}</div>
      </div>
    </details>
  );
}
