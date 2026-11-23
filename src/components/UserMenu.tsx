"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@/mocks/members";
import { Avatar } from "@/components/ui/avatar";
import { fr } from "@/i18n/fr";

export function UserMenu() {
  return (
    <details className="menu user-menu">
      <summary className="avatar-button" aria-label={fr.actions.openMenu}><Avatar member={currentUser} /></summary>
      <div className="menu-popover user-popover">
        <div className="user-summary"><Avatar member={currentUser} /><span><strong>{currentUser.name}</strong><small>{fr.userMenu.signedInAs}</small></span></div>
        <Link href="/profile"><UserRound size={17} />{fr.userMenu.profile}</Link>
        <Link href="/settings"><Settings size={17} />{fr.userMenu.settings}</Link>
        <button type="button" className="danger-text"><LogOut size={17} />{fr.actions.logout}</button>
      </div>
    </details>
  );
}
