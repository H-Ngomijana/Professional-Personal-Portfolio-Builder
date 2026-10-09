import { z } from "zod";

const safeHref = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => {
    if (value.startsWith("/")) return true;
    try {
      return ["http:", "https:", "mailto:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use a valid web or email link.");

const safeImageUrl = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((value) => {
    if (value.startsWith("/")) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use a valid image URL.");

export const portfolioProjectSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(80),
  image_url: safeImageUrl,
  alt: z.string().trim().min(5).max(250),
  tags: z.array(z.string().trim().min(1).max(40)).max(10),
  description: z.string().trim().min(10).max(500),
  details: z.string().trim().min(10).max(2000),
  href: safeHref,
  published: z.boolean(),
});

export const portfolioToolSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(80),
  note: z.string().trim().min(2).max(180),
  icon_slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/),
  published: z.boolean(),
});

export const portfolioImageSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(1).max(7_000_000),
});

export const deletePortfolioContentSchema = z.object({
  kind: z.enum(["project", "tool"]),
  id: z.string().uuid(),
});

export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  alt: string;
  tags: string[];
  description: string;
  details: string;
  href: string;
  published: boolean;
};

export type PortfolioTool = {
  id: string;
  name: string;
  role: string;
  note: string;
  icon_slug: string;
  published: boolean;
};
