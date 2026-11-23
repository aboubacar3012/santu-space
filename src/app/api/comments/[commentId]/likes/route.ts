import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api-response";

export async function POST(_request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params;
    const comment = await prisma.comment.findUniqueOrThrow({ where: { id: commentId }, include: { post: { select: { communityId: true } } } });
    const { userId } = await requireMembership(comment.post.communityId);
    const created = await prisma.commentLike.createMany({ data: { commentId, userId }, skipDuplicates: true });
    if (!created.count) await prisma.commentLike.deleteMany({ where: { commentId, userId } });
    const likes = await prisma.commentLike.count({ where: { commentId } });
    return NextResponse.json({ liked: created.count > 0, likes });
  } catch (error) {
    return apiError(error);
  }
}
