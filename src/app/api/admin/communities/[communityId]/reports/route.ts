import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api-response";

export async function GET(_request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params;
    await requireMembership(communityId, [MembershipRole.ADMIN, MembershipRole.MODERATOR]);
    const reports = await prisma.report.findMany({
      where: { communityId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { post: { select: { id: true, title: true } }, reporter: { select: { id: true, firstName: true, lastName: true } } },
    });
    return NextResponse.json(reports);
  } catch (error) {
    return apiError(error);
  }
}
