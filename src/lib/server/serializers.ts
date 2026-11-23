import type { Prisma } from "@prisma/client";

type UserView = Prisma.UserGetPayload<{ select: {
  id: true; firstName: true; lastName: true; email: true; phone: true; showEmail: true; showPhone: true; avatarColor: true; bio: true;
} }>;

export function memberDto(user: UserView) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return {
    id: user.id,
    name,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.showEmail ? user.email : undefined,
    phone: user.showPhone ? user.phone : undefined,
    showEmail: user.showEmail,
    showPhone: user.showPhone,
    initials: `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase(),
    color: user.avatarColor,
    bio: user.bio ?? "",
  };
}
