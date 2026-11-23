import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { reportReviewSchema } from "@/lib/server/schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = await params;
    const report = await prisma.report.findUniqueOrThrow({ where: { id: reportId }, select: { communityId: true } });
    const { userId } = await requireMembership(report.communityId, [MembershipRole.ADMIN, MembershipRole.MODERATOR]);
    const input = await parseJson(request, reportReviewSchema);
    const reviewed = await prisma.report.update({
      where: { id: reportId },
      data: { status: input.status, reviewedById: userId, reviewedAt: new Date() },
    });
    return NextResponse.json(reviewed);
  } catch (error) {
    return apiError(error);
  }
}
