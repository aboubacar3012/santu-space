"use client";

import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { community } from "@/mocks/community";
import { api } from "@/lib/api";
import { fr } from "@/i18n/fr";
import type { Member, MemberRole } from "@/types";
import { MemberCard } from "@/components/MemberCard";
import { SkeletonMember } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | MemberRole>("all");

  useEffect(() => {
    void api.getMembers().then(setMembers).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => members.filter((member) =>
    (role === "all" || member.role === role) && member.name.toLowerCase().includes(query.toLowerCase().trim()),
  ), [members, query, role]);

  return (
    <section className="members-page">
      <div className="standard-page-heading"><div className="page-icon"><Users size={23} /></div><div><p className="eyebrow">{community.name}</p><h1>{fr.members.title}</h1><p>{fr.members.subtitle}</p></div><span className="heading-count">{members.length}</span></div>
      <div className="member-toolbar">
        <label><Search size={17} /><span className="sr-only">{fr.members.search}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={fr.members.search} /></label>
        <select aria-label={fr.members.role} value={role} onChange={(event) => setRole(event.target.value as "all" | MemberRole)}>
          <option value="all">{fr.members.allRoles}</option>
          <option value="admin">{fr.members.admin}</option>
          <option value="moderator">{fr.members.moderator}</option>
          <option value="member">{fr.members.member}</option>
        </select>
      </div>
      {error ? <EmptyState title={fr.state.error} /> : loading ? <div className="member-grid" aria-label={fr.common.loadingMembers} aria-busy="true">{Array.from({ length: 8 }, (_, index) => <SkeletonMember key={index} />)}</div> : filtered.length ? <div className="member-grid">{filtered.map((member) => <MemberCard key={member.id} member={member} />)}</div> : <EmptyState title={fr.state.empty} />}
    </section>
  );
}
