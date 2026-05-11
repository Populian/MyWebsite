import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { scheduleEvents } from "../../db/schema.js";
import { eq, asc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const method = req.method;
  const id = context.params?.id;

  if (method === "GET") {
    const events = await db.select().from(scheduleEvents).orderBy(asc(scheduleEvents.eventDate));
    return Response.json(events);
  }

  if (method === "POST") {
    const body = await req.json();
    if (!body.title || !body.eventDate) {
      return Response.json({ error: "Title and date are required" }, { status: 400 });
    }
    const [created] = await db.insert(scheduleEvents).values({
      eventDate: body.eventDate,
      title: body.title,
      venue: body.venue || "",
      cityCountry: body.cityCountry || "",
      workPerformed: body.workPerformed || "",
      link: body.link || "",
    }).returning();
    return Response.json(created, { status: 201 });
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    for (const f of ["eventDate", "title", "venue", "cityCountry", "workPerformed", "link"]) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    const [updated] = await db.update(scheduleEvents).set(updateData).where(eq(scheduleEvents.id, parseInt(id))).returning();
    if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(updated);
  }

  if (method === "DELETE" && id) {
    const [deleted] = await db.delete(scheduleEvents).where(eq(scheduleEvents.id, parseInt(id))).returning();
    if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/schedule", "/api/schedule/:id"],
};
