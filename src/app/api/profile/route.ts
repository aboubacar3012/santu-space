import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/server/auth";
import { apiError, parseJson } from "@/lib/server/api-response";
import { profileSchema } from "@/lib/server/schemas";
import { prisma } from "@/lib/prisma";

const select = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  showEmail: true,
  showPhone: true,
  avatarColor: true,
  bio: true,
  createdAt: true,
  memberships: {
    where: { communityId: process.env.SANTU_MOCK_COMMUNITY_ID ?? "lycee-conakry" },
    select: { role: true, joinedAt: true },
    take: 1,
  },
  _count: { select: { posts: true } },
} as const;

function profileDto(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  showEmail: boolean;
  showPhone: boolean;
  avatarColor: string;
  bio: string | null;
  createdAt: Date;
  isActive: boolean;
  memberships: { role: string; joinedAt: Date }[];
  _count: { posts: number };
}) {
  const membership = user.memberships[0];
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone,
    showEmail: user.showEmail,
    showPhone: user.showPhone,
    initials: `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(),
    color: user.avatarColor,
    bio: user.bio ?? "",
    role: membership?.role.toLowerCase() ?? "member",
    joinedAt: membership?.joinedAt ?? user.createdAt,
    posts: user._count.posts,
    online: user.isActive,
  };
}

export async function GET() {
  try {
    const userId = getSessionUserId();
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { ...select, isActive: true } });
    if (!user) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    return NextResponse.json(profileDto(user));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = getSessionUserId();
    const input = await parseJson(request, profileSchema);
    const user = await prisma.user.update({ where: { id: userId }, data: input, select: { ...select, isActive: true } });
    return NextResponse.json(profileDto(user));
  } catch (error) {
    return apiError(error);
  }
}
