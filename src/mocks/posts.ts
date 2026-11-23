import type { Comment, Post } from "@/types";

const topics = [
  ["general", "Bienvenue dans notre nouvel espace !", "Voici notre point de rencontre pour mieux apprendre ensemble. Présentez-vous en quelques mots et dites ce que vous aimeriez partager avec la communauté."],
  ["announcements", "Réunion de rentrée des représentants", "La réunion des représentants de classe aura lieu samedi à 9 h dans la salle polyvalente. Nous ferons le point sur les projets du trimestre."],
  ["mathematics", "Une méthode simple pour réviser les équations", "Je vous partage la méthode qui m'aide : isoler l'inconnue, vérifier chaque étape, puis tester le résultat dans l'équation de départ."],
  ["science", "Compte rendu : séance au laboratoire", "Aujourd'hui, nous avons observé la transformation chimique entre le bicarbonate et le vinaigre. Qu'avez-vous retenu de cette expérience ?"],
  ["help", "Besoin d'aide pour préparer l'exposé d'histoire", "Je cherche des idées de plan et des sources fiables sur les grands royaumes d'Afrique de l'Ouest. Qui peut m'orienter ?"],
  ["languages", "Club de lecture : notre prochaine œuvre", "Nous proposons de lire ensemble un recueil de nouvelles africaines. Partagez vos recommandations et votre disponibilité."],
  ["general", "Les petits gestes qui améliorent nos journées", "Un conseil, une habitude ou une application : racontez ce qui vous aide à rester organisé·e pendant une semaine chargée."],
  ["mathematics", "Quiz logarithmes — entraînement du jeudi", "Voici cinq questions progressives pour préparer le prochain contrôle. Prenez votre temps, puis comparez vos démarches."],
  ["announcements", "Collecte solidaire de fournitures", "L'association des élèves organise une collecte de cahiers et de stylos jusqu'à vendredi. Les dons peuvent être déposés auprès de vos délégués."],
  ["science", "Pourquoi le ciel change-t-il de couleur ?", "En observant le ciel au lever et au coucher du soleil, nous avons remarqué de grandes différences. Quel phénomène l'explique ?" ],
  ["help", "Qui participe au groupe de révision ?", "Nous cherchons quatre autres élèves pour réviser les sciences chaque mercredi après les cours. Tous les niveaux de terminale sont bienvenus."],
  ["languages", "Conseils pour améliorer son expression orale", "Je prépare l'épreuve d'oral et je souhaite gagner en aisance. Quelles techniques utilisez-vous pour structurer une prise de parole ?" ],
  ["general", "Photos du tournoi interclasses", "Merci à toutes les équipes pour cette belle journée. Les meilleurs moments seront ajoutés après validation de chaque personne visible."],
  ["announcements", "Modification des horaires de la bibliothèque", "À partir de la semaine prochaine, la bibliothèque ouvrira aussi les mercredis après-midi de 14 h à 18 h pour faciliter les révisions."],
  ["mathematics", "Corrigé collaboratif des probabilités", "Partageons nos solutions et concentrons-nous sur la justification de chaque choix plutôt que sur la réponse finale uniquement."],
] as const;

export const posts: Post[] = topics.map(([categoryId, title, content], index) => ({
  id: `post-${index + 1}`,
  authorId: `member-${(index % 12) + 1}`,
  categoryId,
  title,
  content,
  excerpt: content,
  createdAt: new Date(Date.now() - (index + 1) * 26 * 60 * 60 * 1000).toISOString(),
  likes: [38, 27, 19, 24, 16, 12, 9, 15, 22, 11, 8, 13, 30, 18, 14][index],
  liked: index === 2 || index === 6,
  commentCount: index < 10 ? 4 : 0,
  pinned: index === 0,
  lastCommenterId: index < 10 ? `member-${((index + 3) % 12) + 1}` : undefined,
  attachment: index === 7 ? "Fiche — quiz logarithmes.pdf" : undefined,
}));

const commentTexts = [
  "Merci pour ce partage, c'est très utile pour le groupe.",
  "Je suis d'accord. On pourrait organiser une petite séance ensemble cette semaine.",
  "Est-ce que quelqu'un a un exemple supplémentaire à proposer ?",
  "J'ai essayé cette approche aujourd'hui et le résultat est vraiment plus clair.",
  "Bonne idée ! Je peux apporter mes notes et aider à préparer le plan.",
  "Petit rappel : pensons à citer nos sources avant de partager un document.",
];

export const comments: Comment[] = Array.from({ length: 40 }, (_, index) => {
  const postIndex = index % 10;
  const isReply = index >= 20;
  const parentIndex = isReply ? 2 * postIndex : -1;
  return {
    id: `comment-${index + 1}`,
    postId: `post-${postIndex + 1}`,
    authorId: `member-${((index + 2) % 12) + 1}`,
    content: commentTexts[index % commentTexts.length],
    createdAt: new Date(Date.now() - (index + 2) * 4 * 60 * 60 * 1000).toISOString(),
    parentId: isReply ? `comment-${parentIndex + 1}` : null,
    likes: (index * 3) % 9,
  };
});
