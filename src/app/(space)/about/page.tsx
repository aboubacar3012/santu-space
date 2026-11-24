import { Check, MapPin, ShieldCheck, Users } from "lucide-react";
import { community } from "@/mocks/community";
import { members } from "@/mocks/members";
import { fr } from "@/i18n/fr";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  const admins = members.filter((member) => member.role === "admin" || member.role === "moderator");
  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-hero-art"><span>{community.bannerLabel}</span><i /><i /></div>
        <div className="about-hero-content"><div className="about-community-logo">{community.shortName}</div><p className="eyebrow">{fr.about.description}</p><h1>{community.name}</h1><p><MapPin size={15} />{community.city}</p></div>
      </div>
      <div className="about-grid">
        <div className="about-main">
          <Card className="about-card"><h2>{fr.about.title}</h2><p className="large-copy">{community.description}</p><p className="muted-copy">{fr.about.mission}</p></Card>
          <Card className="about-card"><div className="section-heading"><span><ShieldCheck size={18} /></span><h2>{fr.about.rules}</h2></div><ol className="rules-list">{community.rules.map((rule, index) => <li key={rule}><span>{index + 1}</span><p>{rule}</p><Check size={15} /></li>)}</ol></Card>
        </div>
        <aside className="about-side">
          <Card className="about-stats"><div><strong>{community.memberCount.toLocaleString("fr-FR")}</strong><span><Users size={14} />{fr.community.members}</span></div><div><strong>{community.onlineCount}</strong><span>{fr.community.online}</span></div></Card>
          <Card className="admin-card"><h2>{fr.about.admins}</h2><div>{admins.map((member) => <div key={member.id} className="admin-row"><Avatar member={member} /><span><strong>{member.name}</strong><small>{fr.members[member.role]}</small></span></div>)}</div></Card>
        </aside>
      </div>
    </section>
  );
}
