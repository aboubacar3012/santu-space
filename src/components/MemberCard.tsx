import { Mail, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { fr } from "@/i18n/fr";
import { formatDate } from "@/lib/utils";
import type { Member } from "@/types";

export function MemberCard({ member }: { member: Member }) {
  const email = member.showEmail ? member.email : undefined;
  const phone = member.showPhone ? member.phone : undefined;

  return (
    <li className="member-row">
      <Avatar member={member} size="md" />
      <div className="member-row-main">
        <strong>{member.name}</strong>
        <small>{fr.members.joined} {formatDate(member.joinedAt)}</small>
        {email || phone ? (
          <span className="member-row-contact">
            {email ? <span><Mail size={12} aria-hidden="true" />{email}</span> : null}
            {phone ? <span><Phone size={12} aria-hidden="true" />{phone}</span> : null}
          </span>
        ) : null}
      </div>
      {member.role !== "member" ? <span className={`role-badge role-${member.role}`}>{fr.members[member.role]}</span> : null}
    </li>
  );
}
