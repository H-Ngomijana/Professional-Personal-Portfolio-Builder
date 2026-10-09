import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  deletePortfolioContent,
  savePortfolioProject,
  savePortfolioTool,
  uploadPortfolioImage,
} from "@/lib/portfolio-content.functions";
import {
  portfolioProjectSchema,
  portfolioToolSchema,
  type PortfolioProject,
  type PortfolioTool,
} from "@/lib/portfolio-content";

type ContentKind = "project" | "tool";

type Props = {
  kind: ContentKind;
  projects: PortfolioProject[];
  tools: PortfolioTool[];
  onRefresh: () => Promise<unknown>;
};

export function AdminContentManager({ kind, projects, tools, onRefresh }: Props) {
  const saveProject = useServerFn(savePortfolioProject);
  const saveTool = useServerFn(savePortfolioTool);
  const deleteContent = useServerFn(deletePortfolioContent);
  const uploadImage = useServerFn(uploadPortfolioImage);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const items = kind === "project" ? projects : tools;
  const editingProject =
    kind === "project" ? projects.find((item) => item.id === editingId) : undefined;
  const editingTool = kind === "tool" ? tools.find((item) => item.id === editingId) : undefined;

  function startNew() {
    setEditingId("new");
    setImageUrl("");
    setNotice("");
  }

  function editProject(item: PortfolioProject) {
    setEditingId(item.id);
    setImageUrl(item.image_url);
    setNotice("");
  }

  function editTool(item: PortfolioTool) {
    setEditingId(item.id);
    setNotice("");
  }

  async function refreshContent() {
    await Promise.all([
      onRefresh(),
      queryClient.invalidateQueries({ queryKey: ["public-portfolio-content"] }),
    ]);
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = portfolioProjectSchema.safeParse({
      id: editingId === "new" ? undefined : (editingId ?? undefined),
      title: form.get("title"),
      category: form.get("category"),
      image_url: imageUrl,
      alt: form.get("alt"),
      tags: String(form.get("tags"))
        .split("\n")
        .map((tag) => tag.trim())
        .filter(Boolean),
      description: form.get("description"),
      details: form.get("details"),
      href: form.get("href"),
      published: form.get("published") === "on",
    });
    if (!parsed.success) {
      setNotice("Check each project field, including the image and live link.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      await saveProject({ data: parsed.data });
      await refreshContent();
      setEditingId(null);
      setNotice("Project saved.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Project could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function submitTool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = portfolioToolSchema.safeParse({
      id: editingId === "new" ? undefined : (editingId ?? undefined),
      name: form.get("name"),
      role: form.get("role"),
      note: form.get("note"),
      icon_slug: form.get("icon_slug"),
      published: form.get("published") === "on",
    });
    if (!parsed.success) {
      setNotice("Check the tool name, role, note, and icon slug.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      await saveTool({ data: parsed.data });
      await refreshContent();
      setEditingId(null);
      setNotice("Tool saved.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Tool could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImageUpload(file?: File) {
    if (!file) return;
    const contentType = file.type;
    if (
      (contentType !== "image/jpeg" &&
        contentType !== "image/png" &&
        contentType !== "image/webp") ||
      file.size > 5 * 1024 * 1024
    ) {
      setNotice("Choose a JPEG, PNG, or WebP image smaller than 5 MB.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Image could not be read."));
        });
        reader.addEventListener("error", () => reject(new Error("Image could not be read.")));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      const result = await uploadImage({
        data: {
          contentType,
          base64,
        },
      });
      setImageUrl(result.imageUrl);
      setNotice("Image uploaded. Save the project to publish its changes.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Image upload could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id: string, title: string) {
    if (!window.confirm(`Delete ${kind} “${title}”?`)) return;
    setBusy(true);
    setNotice("");
    try {
      await deleteContent({ data: { kind, id } });
      await refreshContent();
      if (editingId === id) setEditingId(null);
      setNotice(`${kind === "project" ? "Project" : "Tool"} deleted.`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : `The ${kind} could not be deleted.`);
    } finally {
      setBusy(false);
    }
  }

  const title = kind === "project" ? "project" : "tool";

  return (
    <>
      <Button onClick={startNew}>
        <Plus />
        New {title}
      </Button>
      {editingId && kind === "project" && (
        <form
          key={`project-${editingId}`}
          className="inquiry-form admin-form"
          onSubmit={submitProject}
        >
          <div className="form-row">
            <label>
              Project name
              <Input
                name="title"
                required
                minLength={2}
                maxLength={100}
                defaultValue={editingProject?.title}
              />
            </label>
            <label>
              Category
              <Input
                name="category"
                required
                minLength={2}
                maxLength={80}
                defaultValue={editingProject?.category}
              />
            </label>
          </div>
          <label>
            Image
            <Input
              name="image_url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              required
              maxLength={1000}
              placeholder="/projects/example.png or uploaded image"
            />
          </label>
          <label className="admin-upload">
            <span>Upload project image (JPEG, PNG, or WebP; max 5 MB)</span>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => void handleImageUpload(event.currentTarget.files?.[0])}
            />
          </label>
          <label>
            Image description
            <Input
              name="alt"
              required
              minLength={5}
              maxLength={250}
              defaultValue={editingProject?.alt}
            />
          </label>
          <label>
            Project tags — one per line
            <Textarea name="tags" maxLength={400} defaultValue={editingProject?.tags.join("\n")} />
          </label>
          <label>
            Short description
            <Textarea
              name="description"
              required
              minLength={10}
              maxLength={500}
              defaultValue={editingProject?.description}
            />
          </label>
          <label>
            Project details
            <Textarea
              name="details"
              required
              minLength={10}
              maxLength={2000}
              defaultValue={editingProject?.details}
            />
          </label>
          <label>
            Live project link
            <Input
              name="href"
              required
              maxLength={1000}
              defaultValue={editingProject?.href}
              placeholder="https://example.com"
            />
          </label>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editingProject?.published ?? true}
            />
            Publish project
          </label>
          <div className="flex gap-3">
            <Button disabled={busy} type="submit">
              <Save />
              {busy ? "Saving…" : "Save project"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      {editingId && kind === "tool" && (
        <form key={`tool-${editingId}`} className="inquiry-form admin-form" onSubmit={submitTool}>
          <div className="form-row">
            <label>
              Tool name
              <Input
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={editingTool?.name}
              />
            </label>
            <label>
              Role
              <Input
                name="role"
                required
                minLength={2}
                maxLength={80}
                defaultValue={editingTool?.role}
              />
            </label>
          </div>
          <label>
            Short description
            <Input
              name="note"
              required
              minLength={2}
              maxLength={180}
              defaultValue={editingTool?.note}
            />
          </label>
          <label>
            Simple Icons slug (optional)
            <Input
              name="icon_slug"
              maxLength={80}
              pattern="[a-z0-9-]*"
              defaultValue={editingTool?.icon_slug}
              placeholder="nestjs"
            />
          </label>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editingTool?.published ?? true}
            />
            Publish tool
          </label>
          <div className="flex gap-3">
            <Button disabled={busy} type="submit">
              <Save />
              {busy ? "Saving…" : "Save tool"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <div className="admin-list">
        {kind === "project"
          ? projects.map((item) => (
              <article key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.category} · {item.published ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => editProject(item)}>
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Delete ${item.title}`}
                    onClick={() => void removeItem(item.id, item.title)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </article>
            ))
          : tools.map((item) => (
              <article key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.role} · {item.published ? "Published" : "Draft"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => editTool(item)}>
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Delete ${item.name}`}
                    onClick={() => void removeItem(item.id, item.name)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </article>
            ))}
        {!items.length && <p>No {kind === "project" ? "projects" : "tools"} yet.</p>}
      </div>
      {notice && (
        <p role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </>
  );
}
