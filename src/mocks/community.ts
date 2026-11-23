import type { Community, Category, Report } from "@/types";

export const community: Community = {
  id: "lycee-conakry",
  name: "Santu Space Network",
  shortName: "LEC",
  description: "Un espace calme et vivant pour partager les cours, s'entraider, célébrer nos réussites et rester informés.",
  city: "Conakry, Guinée",
  bannerLabel: "Apprendre · Partager · Grandir",
  rules: [
    "Respecter chaque personne, chaque opinion et chaque niveau d'apprentissage.",
    "Partager des contenus utiles, vérifiés et adaptés à la communauté scolaire.",
    "Protéger les données personnelles et demander l'accord avant toute publication.",
    "Éviter le spam, la publicité et les doublons.",
  ],
  memberCount: 1284,
  onlineCount: 68,
};

export const categories: Category[] = [
  { id: "general", name: "Général", color: "green", order: 0 },
  { id: "announcements", name: "Annonces", color: "blue", order: 1 },
  { id: "mathematics", name: "Mathématiques", color: "purple", order: 2 },
  { id: "science", name: "Sciences", color: "orange", order: 3 },
  { id: "languages", name: "Langues", color: "pink", order: 4 },
  { id: "help", name: "Entraide", color: "yellow", order: 5 },
];

export const reports: Report[] = [
  {
    id: "report-1",
    postId: "post-9",
    reason: "Message potentiellement hors sujet",
    createdAt: "2026-11-20T09:15:00.000Z",
    status: "pending",
  },
  {
    id: "report-2",
    postId: "post-12",
    reason: "Demande de suppression de données personnelles",
    createdAt: "2026-11-21T15:40:00.000Z",
    status: "pending",
  },
];
