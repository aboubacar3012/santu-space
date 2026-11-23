import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { postSchema } from "@/lib/server/schemas";

export async function GET(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params;
    await requireMembership(communityId);
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const sort = url.searchParams.get("sort") ?? "recent";
    const take = Math.min(Math.max(Number(url.searchParams.get("take")) || 12, 1), 30);
    const cursor = url.searchParams.get("cursor");
    const orderBy = sort === "popular"
      ? [{ likes: { _count: "desc" as const } }, { createdAt: "desc" as const }]
      : [{ pinned: "desc" as const }, { createdAt: "desc" as const }];
    const posts = await prisma.post.findMany({
      where: { communityId, ...(categoryId ? { categoryId } : {}) },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy,
      include: {
        author: true,
        category: true,
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
        comments: { take: 1, orderBy: { createdAt: "desc" }, select: { author: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
    return NextResponse.json({ items: posts, nextCursor: posts.length === take ? posts.at(-1)?.id ?? null : null });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params;
    const { userId } = await requireMembership(communityId);
    const input = await parseJson(request, postSchema);
    const category = await prisma.category.findFirst({ where: { id: input.categoryId, communityId }, select: { id: true } });
    if (!category) return NextResponse.json({ error: "Catégorie introuvable." }, { status: 422 });
    const post = await prisma.post.create({
      data: { ...input, communityId, authorId: userId },
      include: { author: true, category: true, likes: true },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
