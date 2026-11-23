import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isManager, requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { commentSchema } from "@/lib/server/schemas";

async function authorize(commentId: string) {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: { post: { select: { communityId: true } } },
  });
  const { userId, membership } = await requireMembership(comment.post.communityId);
  return { comment, allowed: comment.authorId === userId || isManager(membership.role) };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params;
    const { comment, allowed } = await authorize(commentId);
    if (!allowed) return NextResponse.json({ error: "Modification refusée." }, { status: 403 });
    const { content } = await parseJson(request, commentSchema.pick({ content: true }));
    const updated = await prisma.comment.update({ where: { id: comment.id }, data: { content } });
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params;
    const { comment, allowed } = await authorize(commentId);
    if (!allowed) return NextResponse.json({ error: "Suppression refusée." }, { status: 403 });
    await prisma.comment.delete({ where: { id: comment.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
