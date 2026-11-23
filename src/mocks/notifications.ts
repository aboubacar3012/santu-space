import type { AppNotification } from "@/types";

const messages = [
  ["reply", "member-2", "post-1", "a répondu à votre publication."],
  ["mention", "member-5", "post-3", "vous a mentionné dans une discussion."],
  ["like", "member-4", "post-1", "a aimé votre publication."],
  ["reply", "member-7", "post-5", "a ajouté une ressource utile."],
  ["mention", "member-9", "post-8", "vous a invité à répondre."],
  ["like", "member-10", "post-4", "a aimé votre réponse."],
  ["reply", "member-3", "post-2", "a répondu à votre annonce."],
  ["mention", "member-6", "post-11", "vous a mentionné dans le groupe d'étude."],
  ["like", "member-8", "post-3", "a aimé votre méthode de révision."],
  ["reply", "member-12", "post-7", "a partagé son expérience."],
] as const;

export const notifications: AppNotification[] = messages.map(([type, actorId, postId, message], index) => ({
  id: `notification-${index + 1}`,
  type,
  actorId,
  postId,
  message,
  createdAt: new Date(Date.now() - (index + 1) * 5 * 60 * 60 * 1000).toISOString(),
  read: index > 3,
}));
