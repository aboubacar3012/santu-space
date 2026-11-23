import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { commentSchema } from "@/lib/server/schemas";

export async function GET(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { communityId: true } });
    await requireMembership(post.communityId);
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { author: true, likes: { select: { userId: true } } },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { communityId: true } });
    const { userId } = await requireMembership(post.communityId);
    const input = await parseJson(request, commentSchema);
    if (input.parentId) {
      const parent = await prisma.comment.findFirst({ where: { id: input.parentId, postId }, select: { parentId: true } });
      if (!parent) return NextResponse.json({ error: "Commentaire parent introuvable." }, { status: 422 });
      if (parent.parentId) return NextResponse.json({ error: "Deux niveaux de réponse maximum." }, { status: 422 });
    }
    const comment = await prisma.comment.create({
      data: { postId, authorId: userId, ...input },
      include: { author: true, likes: true },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
