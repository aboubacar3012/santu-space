import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/server/auth";
import { apiError } from "@/lib/server/api-response";

export async function GET() {
  try {
    const recipientId = getSessionUserId();
    const notifications = await prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications.map((item) => ({ ...item, type: item.type.toLowerCase() })));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH() {
  try {
    const recipientId = getSessionUserId();
    await prisma.notification.updateMany({ where: { recipientId, read: false }, data: { read: true } });
    const notifications = await prisma.notification.findMany({ where: { recipientId }, orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json(notifications.map((item) => ({ ...item, type: item.type.toLowerCase() })));
  } catch (error) {
    return apiError(error);
  }
}
