import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { reportSchema } from "@/lib/server/schemas";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUniqueOrThrow({ where: { id: postId }, select: { communityId: true } });
    const { userId } = await requireMembership(post.communityId);
    const input = await parseJson(request, reportSchema);
    const report = await prisma.report.create({
      data: { communityId: post.communityId, postId, reporterId: userId, reason: input.reason },
    });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
