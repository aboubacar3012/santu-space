import { categories as initialCategories, community, reports as initialReports } from "@/mocks/community";
import { members, currentUser } from "@/mocks/members";
import { notifications as initialNotifications } from "@/mocks/notifications";
import { comments as initialComments, posts as initialPosts } from "@/mocks/posts";
import type { AppNotification, Category, Comment, Member, Post, Report } from "@/types";

let posts = [...initialPosts];
let comments = [...initialComments];
let notifications = [...initialNotifications];
let categories = [...initialCategories];
let reports = [...initialReports];

const useDatabase = process.env.NEXT_PUBLIC_DATA_SOURCE === "database";
const communityId = community.id;
const sessionMemberId = "member-1";

const wait = (duration = 420) => new Promise((resolve) => setTimeout(resolve, duration));

async function result<T>(value: T, duration?: number): Promise<T> {
  await wait(duration);
  return structuredClone(value);
}

async function remote<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Erreur serveur." }));
    throw new Error(body.error ?? "Erreur serveur.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

type DatabaseCommunity = typeof community & {
  categories: Category[];
  members: Member[];
};

type DatabasePost = {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  content: string;
  attachmentUrl?: string | null;
  createdAt: string;
  pinned: boolean;
  likes: { userId: string }[];
  _count: { comments: number };
  comments: { author: { id: string } }[];
};

function toPost(item: DatabasePost): Post {
  return {
    id: item.id,
    authorId: item.authorId,
    categoryId: item.categoryId,
    title: item.title,
    content: item.content,
    excerpt: item.content,
    attachment: item.attachmentUrl ?? undefined,
    createdAt: item.createdAt,
    likes: item.likes?.length ?? 0,
    liked: item.likes?.some((like) => like.userId === sessionMemberId) ?? false,
    commentCount: item._count?.comments ?? 0,
    pinned: item.pinned,
    lastCommenterId: item.comments?.[0]?.author.id,
  };
}

async function getDatabaseCommunity() {
  const data = await remote<DatabaseCommunity>(`/api/communities/${communityId}`);
  return { ...community, ...data, bannerLabel: "Apprendre · Partager · Grandir" };
}

export const api = {
  getCommunity: async () => useDatabase ? getDatabaseCommunity() : result(community),
  getMembers: async () => useDatabase ? (await getDatabaseCommunity()).members : result(members),
  getCurrentUser: async () => useDatabase ? remote<Member>("/api/profile") : result(currentUser, 100),
  updateProfile: async (input: Pick<Member, "firstName" | "lastName" | "email" | "phone" | "showEmail" | "showPhone">): Promise<Member> => {
    if (useDatabase) return remote<Member>("/api/profile", { method: "PATCH", body: JSON.stringify(input) });
    await wait(650);
    Object.assign(currentUser, input, { name: `${input.firstName.trim()} ${input.lastName.trim()}`, initials: `${input.firstName[0] ?? ""}${input.lastName[0] ?? ""}`.toUpperCase() });
    return structuredClone(currentUser);
  },
  getCategories: async () => useDatabase ? (await getDatabaseCommunity()).categories : result(categories),
  getPosts: async () => {
    if (!useDatabase) return result(posts, 650);
    const body = await remote<{ items: DatabasePost[] }>(`/api/communities/${communityId}/posts?take=30`);
    return body.items.map(toPost);
  },
  getPost: async (id: string) => {
    if (!useDatabase) return result(posts.find((post) => post.id === id));
    const item = await remote<DatabasePost>(`/api/posts/${id}`);
    return toPost(item);
  },
  getComments: async (postId: string) => {
    if (!useDatabase) return result(comments.filter((comment) => comment.postId === postId));
    const items = await remote<(Comment & { likes: { userId: string }[] })[]>(`/api/posts/${postId}/comments`);
    return items.map((item) => ({ ...item, likes: item.likes.length }));
  },
  getNotifications: async () => useDatabase ? remote<AppNotification[]>("/api/notifications") : result(notifications),
  getReports: async () => useDatabase ? remote<Report[]>(`/api/admin/communities/${communityId}/reports`) : result(reports),
  getTopMembers: async () => {
    if (!useDatabase) return result([...members].sort((a, b) => b.posts - a.posts).slice(0, 5));
    return (await getDatabaseCommunity()).members.sort((a, b) => b.posts - a.posts).slice(0, 5);
  },
  createPost: async (input: Pick<Post, "title" | "content" | "categoryId">): Promise<Post> => {
    if (useDatabase) {
      const item = await remote<DatabasePost>(`/api/communities/${communityId}/posts`, { method: "POST", body: JSON.stringify(input) });
      return toPost({ ...item, likes: [], _count: { comments: 0 }, comments: [] });
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("offline");
    await wait(850);
    const post: Post = {
      ...input,
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      excerpt: input.content,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      commentCount: 0,
      pinned: false,
    };
    posts = [post, ...posts];
    return structuredClone(post);
  },
  createComment: async (postId: string, content: string, parentId: string | null): Promise<Comment> => {
    if (useDatabase) {
      const item = await remote<Comment & { likes: { userId: string }[] }>(`/api/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content, parentId }) });
      return { ...item, likes: item.likes.length };
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("offline");
    await wait(750);
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      content,
      parentId,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    comments = [...comments, comment];
    posts = posts.map((post) =>
      post.id === postId ? { ...post, commentCount: post.commentCount + 1, lastCommenterId: currentUser.id } : post,
    );
    return structuredClone(comment);
  },
  toggleLike: async (postId: string): Promise<Post[]> => {
    if (useDatabase) {
      await remote(`/api/posts/${postId}/likes`, { method: "POST" });
      return api.getPosts();
    }
    posts = posts.map((post) =>
      post.id === postId
        ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
        : post,
    );
    return result(posts, 120);
  },
  togglePin: async (postId: string): Promise<Post[]> => {
    if (useDatabase) {
      const post = await api.getPost(postId);
      if (!post) throw new Error("Publication introuvable.");
      await remote(`/api/posts/${postId}`, { method: "PATCH", body: JSON.stringify({ pinned: !post.pinned }) });
      return api.getPosts();
    }
    posts = posts.map((post) => post.id === postId ? { ...post, pinned: !post.pinned } : post);
    return result(posts, 180);
  },
  deletePost: async (postId: string): Promise<void> => {
    if (useDatabase) return remote<void>(`/api/posts/${postId}`, { method: "DELETE" });
    posts = posts.filter((post) => post.id !== postId);
    comments = comments.filter((comment) => comment.postId !== postId);
    return result(undefined, 250);
  },
  markNotificationsRead: async (): Promise<AppNotification[]> => {
    if (useDatabase) return remote<AppNotification[]>("/api/notifications", { method: "PATCH" });
    notifications = notifications.map((notification) => ({ ...notification, read: true }));
    return result(notifications, 180);
  },
  saveCategories: async (value: Category[]): Promise<Category[]> => {
    if (useDatabase) return remote<Category[]>(`/api/communities/${communityId}/categories`, { method: "PUT", body: JSON.stringify({ categories: value }) });
    categories = value;
    return result(categories, 300);
  },
  resolveReport: async (reportId: string): Promise<Report[]> => {
    if (useDatabase) {
      await remote(`/api/admin/reports/${reportId}`, { method: "PATCH", body: JSON.stringify({ status: "REVIEWED" }) });
      return api.getReports();
    }
    reports = reports.map((report) => report.id === reportId ? { ...report, status: "reviewed" } : report);
    return result(reports, 220);
  },
  updatePost: async (postId: string, input: Pick<Post, "title" | "content">): Promise<Post> => {
    if (useDatabase) {
      const post = await remote<DatabasePost>(`/api/posts/${postId}`, { method: "PATCH", body: JSON.stringify(input) });
      return toPost({ ...post, likes: post.likes ?? [], _count: post._count ?? { comments: 0 }, comments: post.comments ?? [] });
    }
    posts = posts.map((post) => post.id === postId ? { ...post, ...input, excerpt: input.content } : post);
    return (await result(posts.find((post) => post.id === postId)!));
  },
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    if (useDatabase) return remote<Comment>(`/api/comments/${commentId}`, { method: "PATCH", body: JSON.stringify({ content }) });
    comments = comments.map((comment) => comment.id === commentId ? { ...comment, content } : comment);
    return result(comments.find((comment) => comment.id === commentId)!);
  },
  deleteComment: async (commentId: string): Promise<void> => {
    if (useDatabase) return remote<void>(`/api/comments/${commentId}`, { method: "DELETE" });
    comments = comments.filter((comment) => comment.id !== commentId && comment.parentId !== commentId);
    return result(undefined, 220);
  },
  toggleCommentLike: async (commentId: string): Promise<{ likes: number; liked: boolean }> => {
    if (useDatabase) return remote<{ likes: number; liked: boolean }>(`/api/comments/${commentId}/likes`, { method: "POST" });
    const comment = comments.find((item) => item.id === commentId);
    if (!comment) throw new Error("Commentaire introuvable.");
    comments = comments.map((item) => item.id === commentId ? { ...item, likes: Math.max(0, item.likes + 1) } : item);
    return result({ likes: comment.likes + 1, liked: true }, 120);
  },
};
