import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { works } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const method = req.method;
  const id = context.params?.id;

  if (method === "GET") {
    const allWorks = await db.select().from(works).orderBy(desc(works.featured), works.sortOrder, desc(works.year));
    return Response.json(allWorks);
  }

  if (method === "POST") {
    const body = await req.json();
    if (!body.title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    const [created] = await db.insert(works).values({
      title: body.title,
      year: body.year ? parseInt(body.year) : null,
      category: body.category || "",
      medium: body.medium || "",
      description: body.description || "",
      programNote: body.programNote || "",
      premiereInfo: body.premiereInfo || "",
      festivalSelections: body.festivalSelections || "",
      youtubeUrl: body.youtubeUrl || "",
      soundcloudUrl: body.soundcloudUrl || "",
      audioUrl: body.audioUrl || "",
      scorePdfUrl: body.scorePdfUrl || "",
      coverImage: body.coverImage || "",
      galleryImages: JSON.stringify(body.galleryImages || []),
      tags: JSON.stringify(body.tags || []),
      featured: body.featured || false,
      sortOrder: body.sortOrder || 0,
    }).returning();
    return Response.json(created, { status: 201 });
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    const fields = [
      "title", "category", "medium", "description", "programNote",
      "premiereInfo", "festivalSelections", "youtubeUrl", "soundcloudUrl",
      "audioUrl", "scorePdfUrl", "coverImage",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.year !== undefined) updateData.year = body.year ? parseInt(body.year) : null;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.galleryImages !== undefined) updateData.galleryImages = JSON.stringify(body.galleryImages);
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);

    const [updated] = await db.update(works).set(updateData).where(eq(works.id, parseInt(id))).returning();
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(updated);
  }

  if (method === "DELETE" && id) {
    const [deleted] = await db.delete(works).where(eq(works.id, parseInt(id))).returning();
    if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/works", "/api/works/:id"],
};
