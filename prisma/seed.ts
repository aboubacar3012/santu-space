import { MembershipRole, NotificationType, PrismaClient, ReportStatus } from "@prisma/client";
import { community, categories as mockCategories, reports as mockReports } from "../src/mocks/community";
import { comments as mockComments, posts as mockPosts } from "../src/mocks/posts";
import { members } from "../src/mocks/members";
import { notifications as mockNotifications } from "../src/mocks/notifications";

const prisma = new PrismaClient();

function role(value: string): MembershipRole {
  if (value === "admin") return MembershipRole.ADMIN;
  if (value === "moderator") return MembershipRole.MODERATOR;
  return MembershipRole.MEMBER;
}

async function main() {
  await prisma.community.deleteMany({ where: { id: community.id } });

  for (const member of members) {
    await prisma.user.upsert({
      where: { id: member.id },
      create: {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email ?? `${member.id}@exemple.gn`,
        phone: member.phone,
        showEmail: member.showEmail,
        showPhone: member.showPhone,
        avatarColor: member.color,
        bio: member.bio,
      },
      update: {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        showEmail: member.showEmail,
        showPhone: member.showPhone,
        avatarColor: member.color,
        bio: member.bio,
      },
    });
  }

  await prisma.community.create({
    data: {
      id: community.id,
      name: community.name,
      shortName: community.shortName,
      description: community.description,
      city: community.city,
      memberships: {
        create: members.map((member) => ({
          userId: member.id,
          role: role(member.role),
          joinedAt: new Date(member.joinedAt),
        })),
      },
      categories: {
        create: mockCategories.map((category) => ({
          id: category.id,
          name: category.name,
          color: category.color,
          order: category.order,
        })),
      },
    },
  });

  for (const post of mockPosts) {
    await prisma.post.create({
      data: {
        id: post.id,
        communityId: community.id,
        authorId: post.authorId,
        categoryId: post.categoryId,
        title: post.title,
        content: post.content,
        attachmentUrl: post.attachment ?? null,
        pinned: post.pinned,
        createdAt: new Date(post.createdAt),
      },
    });
  }

  for (const comment of mockComments) {
    await prisma.comment.create({
      data: {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        parentId: comment.parentId,
        content: comment.content,
        createdAt: new Date(comment.createdAt),
      },
    });
  }

  for (const post of mockPosts.filter((item) => item.liked)) {
    await prisma.postLike.create({ data: { postId: post.id, userId: "member-1" } });
  }

  for (const report of mockReports) {
    await prisma.report.create({
      data: {
        id: report.id,
        communityId: community.id,
        postId: report.postId,
        reporterId: "member-3",
        reason: report.reason,
        status: report.status === "pending" ? ReportStatus.PENDING : ReportStatus.REVIEWED,
        createdAt: new Date(report.createdAt),
      },
    });
  }

  for (const notification of mockNotifications) {
    await prisma.notification.create({
      data: {
        id: notification.id,
        communityId: community.id,
        recipientId: "member-1",
        actorId: notification.actorId,
        postId: notification.postId,
        type: notification.type === "reply"
          ? NotificationType.REPLY
          : notification.type === "mention"
            ? NotificationType.MENTION
            : NotificationType.LIKE,
        message: notification.message,
        read: notification.read,
        createdAt: new Date(notification.createdAt),
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
