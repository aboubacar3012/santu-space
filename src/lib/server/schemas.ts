import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
});

export const postSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(1).max(10_000),
  categoryId: z.string().min(1),
  attachmentUrl: z.string().url().optional().nullable(),
});

export const postUpdateSchema = postSchema.partial().extend({
  pinned: z.boolean().optional(),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1).max(3_000),
  parentId: z.string().min(1).nullable().optional(),
});

export const communitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1_000),
  bannerUrl: z.string().url().nullable().optional(),
});

export const reportSchema = z.object({
  reason: z.string().trim().min(5).max(500),
});

export const reportReviewSchema = z.object({
  status: z.enum(["REVIEWED", "DISMISSED"]),
});
