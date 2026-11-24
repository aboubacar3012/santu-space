import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { fr } from "@/i18n/fr";
import type { Member } from "@/types";

export function TopMembersCard({ members }: { members: Member[] }) {
  return (
    <Card className="top-members-card">
      <div className="section-heading">
        <span>
          <TrendingUp size={18} />
        </span>
        <h2>{fr.members.top}</h2>
      </div>
      <div className="top-member-list">
        {members.map((member, index) => (
          <div key={member.id} className="top-member-row">
            <span className="member-rank">{index + 1}</span>
            <Avatar member={member} size="sm" />
            <span>
              <strong>{member.name}</strong>
              <small>
                {member.posts} {fr.members.activity}
              </small>
            </span>
            {index === 0 ? <Sparkles className="sparkle" size={15} /> : null}
          </div>
        ))}
      </div>
      <Link href="/members" className="view-all-link">
        {fr.actions.viewAll}
      </Link>
    </Card>
  );
}
