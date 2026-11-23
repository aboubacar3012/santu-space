export type MemberRole = "admin" | "moderator" | "member";

export type Member = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  showEmail: boolean;
  showPhone: boolean;
  role: MemberRole;
  joinedAt: string;
  initials: string;
  color: string;
  online: boolean;
  posts: number;
  bio: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type Community = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  city: string;
  bannerLabel: string;
  rules: string[];
  memberCount: number;
  onlineCount: number;
};

export type DeliveryStatus = "idle" | "sending" | "failed";

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  likes: number;
  status?: DeliveryStatus;
};

export type Post = {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  content: string;
  excerpt: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  commentCount: number;
  pinned: boolean;
  lastCommenterId?: string;
  attachment?: string;
  status?: DeliveryStatus;
};

export type AppNotification = {
  id: string;
  type: "reply" | "mention" | "like";
  actorId: string;
  postId: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type Report = {
  id: string;
  postId: string;
  reason: string;
  createdAt: string;
  status: "pending" | "reviewed";
};

export type SortMode = "recent" | "popular" | "pinned";
