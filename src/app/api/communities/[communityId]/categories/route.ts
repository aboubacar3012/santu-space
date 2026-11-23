import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";

const schema = z.object({
  categories: z.array(z.object({ id: z.string().optional(), name: z.string().trim().min(2).max(60), color: z.string().max(24) })).max(30),
});

export async function PUT(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  try {
    const { communityId } = await params;
    await requireMembership(communityId, [MembershipRole.ADMIN]);
    const { categories } = await parseJson(request, schema);
    const result = await prisma.$transaction(async (tx) => {
      const ids = categories.flatMap((category) => category.id ? [category.id] : []);
      await tx.category.deleteMany({ where: { communityId, ...(ids.length ? { id: { notIn: ids } } : {}) }, });
      return Promise.all(categories.map((category, order) =>
        category.id
          ? tx.category.update({ where: { id: category.id }, data: { name: category.name, color: category.color, order } })
          : tx.category.create({ data: { communityId, name: category.name, color: category.color, order } }),
      ));
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
