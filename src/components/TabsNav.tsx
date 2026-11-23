"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, GraduationCap, Home, Info, Medal, Users } from "lucide-react";
import { fr } from "@/i18n/fr";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: fr.community.tabs.community, icon: Home, active: (path: string) => path === "/" || path.startsWith("/posts") },
  { href: "/members", label: fr.community.tabs.members, icon: Users, active: (path: string) => path === "/members" },
  { href: "/about", label: fr.community.tabs.about, icon: Info, active: (path: string) => path === "/about" },
];

const disabled = [
  { label: fr.community.tabs.classroom, icon: GraduationCap },
  { label: fr.community.tabs.calendar, icon: CalendarDays },
  { label: fr.community.tabs.rankings, icon: Medal },
];

export function TabsNav() {
  const pathname = usePathname();
  return (
    <nav className="tabs-nav" aria-label={fr.common.navigation}>
      {links.map(({ href, label, icon: Icon, active }) => (
        <Link key={href} href={href} className={cn("tab-item", active(pathname) && "active")} aria-current={active(pathname) ? "page" : undefined}>
          <Icon size={17} />{label}
        </Link>
      ))}
      {disabled.map(({ label, icon: Icon }) => (
        <span key={label} className="tab-item tab-disabled" aria-disabled="true"><Icon size={17} />{label}<small>{fr.community.soon}</small></span>
      ))}
    </nav>
  );
}
