import { describe, expect, it } from "vitest";
import { portfolioProjectSchema, portfolioToolSchema } from "@/lib/portfolio-content";

const validProject = {
  title: "Example Project",
  category: "Business platform",
  image_url: "/projects/example.png",
  alt: "Screenshot of the example project",
  tags: ["React", "Platform"],
  description: "A clear, useful project description.",
  details: "A longer summary describing the experience and how it works.",
  href: "https://example.com",
  published: true,
};

describe("Portfolio content validation", () => {
  it("accepts project images stored at local paths or HTTPS URLs", () => {
    expect(portfolioProjectSchema.safeParse(validProject).success).toBe(true);
    expect(
      portfolioProjectSchema.safeParse({
        ...validProject,
        image_url: "https://images.example.com/project.webp",
      }).success,
    ).toBe(true);
  });

  it("rejects executable project links", () => {
    expect(
      portfolioProjectSchema.safeParse({ ...validProject, href: "javascript:alert(1)" }).success,
    ).toBe(false);
  });

  it("accepts the NestJS Simple Icons slug in tool records", () => {
    expect(
      portfolioToolSchema.safeParse({
        name: "NestJS",
        role: "Backend",
        note: "Structured server applications",
        icon_slug: "nestjs",
        published: true,
      }).success,
    ).toBe(true);
  });
});
