import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { communitySchema } from "@/lib/server/schemas";
import { memberDto } from "@/lib/server/serializers";

export async function GET(_request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params;
    await requireMembership(communityId);
    const community = await prisma.community.findUniqueOrThrow({
      where: { id: communityId },
      include: {
        categories: { orderBy: { order: "asc" } },
        memberships: {
          include: { user: { include: { _count: { select: { posts: true } } } } },
          where: { user: { isActive: true } },
        },
      },
    });
    return NextResponse.json({
      ...community,
      memberships: undefined,
      members: community.memberships.map(({ role, joinedAt, user }) => ({
        ...memberDto(user),
        role: role.toLowerCase(),
        joinedAt,
        posts: user._count.posts,
        online: false,
      })),
      memberCount: community.memberships.length,
      onlineCount: community.memberships.filter(({ user }) => user.isActive).length,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params;
    await requireMembership(communityId, [MembershipRole.ADMIN]);
    const data = await parseJson(request, communitySchema);
    const community = await prisma.community.update({ where: { id: communityId }, data });
    return NextResponse.json(community);
  } catch (error) {
    return apiError(error);
  }
}
