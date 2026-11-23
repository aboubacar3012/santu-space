import type { Member } from "@/types";

const names = [
  ["Mariam Diallo", "admin", "MD", "bougainvillier", true, 42],
  ["Ibrahima Camara", "moderator", "IC", "safran", true, 36],
  ["Aïssata Bah", "member", "AB", "lagon", false, 31],
  ["Moussa Sow", "member", "MS", "terre", true, 28],
  ["Fatoumata Keïta", "moderator", "FK", "mangue", true, 24],
  ["Abdoulaye Touré", "member", "AT", "bougainvillier", false, 19],
  ["Kadiatou Barry", "member", "KB", "lagon", true, 17],
  ["Lansana Condé", "member", "LC", "safran", false, 15],
  ["Hawa Sylla", "member", "HS", "mangue", false, 12],
  ["Sékou Fofana", "member", "SF", "terre", true, 11],
  ["Aminata Cissé", "member", "AC", "bougainvillier", false, 8],
  ["Oumar Diakité", "admin", "OD", "lagon", true, 7],
] as const;

export const members: Member[] = names.map(([name, role, initials, color, online, posts], index) => ({
  id: `member-${index + 1}`,
  name,
  firstName: name.split(" ")[0],
  lastName: name.split(" ").slice(1).join(" "),
  email: `membre${index + 1}@exemple.gn`,
  phone: `+224 62 00 ${String(10 + index).padStart(2, "0")} ${String(20 + index).padStart(2, "0")}`,
  showEmail: index === 0 || index % 3 === 0,
  showPhone: index === 0,
  role,
  initials,
  color,
  online,
  posts,
  joinedAt: new Date(2023, index % 10, 5 + index).toISOString(),
  bio: index === 0
    ? "Enseignante de sciences, référente pédagogique de la communauté."
    : "Curieux·se, prêt·e à partager et apprendre avec les autres.",
}));

export const currentUser = members[0];
