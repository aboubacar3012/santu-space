import { CalendarDays, Mail, MessageSquareText, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { fr } from "@/i18n/fr";
import { formatDate } from "@/lib/utils";
import type { Member } from "@/types";

export function MemberCard({ member }: { member: Member }) {
  return (
    <Card className="member-card">
      <div className="member-card-top">
        <Avatar member={member} size="lg" />
        <span className={`role-badge role-${member.role}`}>{fr.members[member.role]}</span>
      </div>
      <h2>{member.name}</h2>
      <p>{member.bio}</p>
      {member.showEmail && member.email || member.showPhone && member.phone ? <div className="member-contact">{member.showEmail && member.email ? <span><Mail size={13} />{member.email}</span> : null}{member.showPhone && member.phone ? <span><Phone size={13} />{member.phone}</span> : null}</div> : null}
      <div className="member-card-meta"><span><CalendarDays size={13} />{fr.members.joined} {formatDate(member.joinedAt)}</span><span><MessageSquareText size={13} />{member.posts} {fr.members.activity}</span></div>
    </Card>
  );
}
