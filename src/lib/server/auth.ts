import { MembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function getSessionUserId() {
  const userId = process.env.SANTU_MOCK_USER_ID;
  if (!userId) throw new ApiError(503, "Session simulée non configurée.");
  return userId;
}

export async function requireMembership(communityId: string, roles: MembershipRole[] = [
  MembershipRole.ADMIN,
  MembershipRole.MODERATOR,
  MembershipRole.MEMBER,
]) {
  const userId = getSessionUserId();
  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId, communityId } },
  });
  if (!membership || !roles.includes(membership.role)) {
    throw new ApiError(403, "Accès refusé pour cette communauté.");
  }
  return { userId, membership };
}

export function isManager(role: MembershipRole) {
  return role === MembershipRole.ADMIN || role === MembershipRole.MODERATOR;
}
