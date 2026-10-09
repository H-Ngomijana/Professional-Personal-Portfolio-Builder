import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireAdminSession } from "@/lib/admin-auth.functions";
import { getServerEnv } from "@/lib/server-env";
import { packageSchema } from "./packages-schema";
import type { Database } from "@/integrations/supabase/types";

export const listPackages = createServerFn({ method: "GET" }).handler(async () => {
  const url = getServerEnv("SUPABASE_URL");
  const key = getServerEnv("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error("Packages are unavailable. Please try again.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
  const { data, error } = await client
    .from("developer_packages")
    .select("id,name,description,features,price,currency")
    .eq("published", true)
    .order("created_at");
  if (error) throw new Error("Packages could not be loaded.");
  return data ?? [];
});

export const adminDashboard = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [packages, inquiries, projects, tools] = await Promise.all([
      supabaseAdmin.from("developer_packages").select("*").order("created_at"),
      supabaseAdmin
        .from("portfolio_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabaseAdmin.from("portfolio_projects").select("*").order("created_at"),
      supabaseAdmin.from("portfolio_tools").select("*").order("created_at"),
    ]);
    if (packages.error || inquiries.error || projects.error || tools.error)
      throw new Error("Your dashboard could not be loaded.");
    return {
      packages: packages.data ?? [],
      inquiries: inquiries.data ?? [],
      projects: projects.data ?? [],
      tools: tools.data ?? [],
    };
  });

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => packageSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...values } = data;
    const result = id
      ? await supabaseAdmin
          .from("developer_packages")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await supabaseAdmin.from("developer_packages").insert(values).select("id").single();
    if (result.error) throw new Error("Package could not be saved.");
    return { id: result.data.id };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((data) => packageSchema.pick({ id: true }).required().parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("developer_packages").delete().eq("id", data.id);
    if (error) throw new Error("Package could not be deleted.");
    return { success: true };
  });
