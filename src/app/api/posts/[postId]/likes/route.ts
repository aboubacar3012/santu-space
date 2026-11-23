import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api-response";

export async function POST(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { communityId: true } });
    const { userId } = await requireMembership(post.communityId);
    const created = await prisma.postLike.createMany({ data: { postId, userId }, skipDuplicates: true });
    if (!created.count) await prisma.postLike.deleteMany({ where: { postId, userId } });
    const likes = await prisma.postLike.count({ where: { postId } });
    return NextResponse.json({ liked: created.count > 0, likes });
  } catch (error) {
    return apiError(error);
  }
}
