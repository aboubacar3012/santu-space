import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isManager, requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { postUpdateSchema } from "@/lib/server/schemas";

async function authorizePost(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { id: true, authorId: true, communityId: true } });
  const { userId, membership } = await requireMembership(post.communityId);
  if (post.authorId !== userId && !isManager(membership.role)) {
    return { post, allowed: false, membership };
  }
  return { post, allowed: true, membership };
}

export async function GET(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUniqueOrThrow({
      where: { id: postId },
      include: {
        author: true,
        category: true,
        likes: { select: { userId: true } },
        comments: { include: { author: true, likes: { select: { userId: true } } }, orderBy: { createdAt: "asc" } },
        _count: { select: { comments: true } },
      },
    });
    await requireMembership(post.communityId);
    return NextResponse.json(post);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const { post, allowed, membership } = await authorizePost(postId);
    if (!allowed) return NextResponse.json({ error: "Modification refusée." }, { status: 403 });
    const input = await parseJson(request, postUpdateSchema);
    const { userId } = await requireMembership(post.communityId);
    const editsContent = input.title !== undefined || input.content !== undefined || input.categoryId !== undefined || input.attachmentUrl !== undefined;
    if (editsContent && post.authorId !== userId) {
      return NextResponse.json({ error: "Seul l’auteur peut modifier cette publication." }, { status: 403 });
    }
    if (input.pinned !== undefined && membership.role !== MembershipRole.ADMIN && membership.role !== MembershipRole.MODERATOR) {
      return NextResponse.json({ error: "Épinglage réservé à l’équipe de modération." }, { status: 403 });
    }
    const updated = await prisma.post.update({ where: { id: post.id }, data: input });
    return NextResponse.json(updated);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const { post, allowed } = await authorizePost(postId);
    if (!allowed) return NextResponse.json({ error: "Suppression refusée." }, { status: 403 });
    await prisma.post.delete({ where: { id: post.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
