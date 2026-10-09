import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { requireAdminSession } from "@/lib/admin-auth.functions";
import { getServerEnv } from "@/lib/server-env";
import type { Database } from "@/integrations/supabase/types";
import {
  deletePortfolioContentSchema,
  portfolioImageSchema,
  portfolioProjectSchema,
  portfolioToolSchema,
} from "./portfolio-content";

function createPublicClient() {
  const url = getServerEnv("SUPABASE_URL");
  const key = getServerEnv("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error("Portfolio content is unavailable. Please try again.");

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const listPortfolioContent = createServerFn({ method: "GET" }).handler(async () => {
  const client = createPublicClient();
  const [projects, tools] = await Promise.all([
    client
      .from("portfolio_projects")
      .select("id,title,category,image_url,alt,tags,description,details,href,published")
      .eq("published", true)
      .order("created_at"),
    client
      .from("portfolio_tools")
      .select("id,name,role,note,icon_slug,published")
      .eq("published", true)
      .order("created_at"),
  ]);
  if (projects.error || tools.error) throw new Error("Portfolio content could not be loaded.");
  return { projects: projects.data ?? [], tools: tools.data ?? [] };
});

export const savePortfolioProject = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => portfolioProjectSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...values } = data;
    const result = id
      ? await supabaseAdmin
          .from("portfolio_projects")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabaseAdmin.from("portfolio_projects").insert(values).select("id").single();
    if (result.error) throw new Error("Project could not be saved.");
    return { id: result.data.id };
  });

export const savePortfolioTool = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => portfolioToolSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...values } = data;
    const result = id
      ? await supabaseAdmin
          .from("portfolio_tools")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabaseAdmin.from("portfolio_tools").insert(values).select("id").single();
    if (result.error) throw new Error("Tool could not be saved.");
    return { id: result.data.id };
  });

export const deletePortfolioContent = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => deletePortfolioContentSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result =
      data.kind === "project"
        ? await supabaseAdmin.from("portfolio_projects").delete().eq("id", data.id)
        : await supabaseAdmin.from("portfolio_tools").delete().eq("id", data.id);
    if (result.error) throw new Error(`The ${data.kind} could not be deleted.`);
    return { success: true };
  });

export const uploadPortfolioImage = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => portfolioImageSchema.parse(data))
  .handler(async ({ data }) => {
    const bytes = Buffer.from(data.base64, "base64");
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
    const validSignature =
      (data.contentType === "image/jpeg" &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff) ||
      (data.contentType === "image/png" &&
        bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
      (data.contentType === "image/webp" &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP");
    if (!validSignature)
      throw new Error("The image file is invalid or uses an unsupported format.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const extension = data.contentType === "image/jpeg" ? "jpg" : data.contentType.split("/")[1];
    const path = `${randomUUID()}.${extension}`;
    const { error } = await supabaseAdmin.storage
      .from("portfolio-projects")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error("Project image could not be uploaded.");
    const { data: publicImage } = supabaseAdmin.storage
      .from("portfolio-projects")
      .getPublicUrl(path);
    return { imageUrl: publicImage.publicUrl };
  });
