import type { Config, Context } from "@netlify/functions";
import {
  buildWorkFromBody,
  loadPortfolioData,
  nextId,
  savePortfolioData,
  sortWorks,
} from "./_shared/blob-data.mjs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected API error";
  console.error(message, error);
  return Response.json({ error: message }, { status: 500 });
}

export default async (req: Request, context: Context) => {
  const id = context.params?.id ? Number.parseInt(context.params.id, 10) : null;

  try {
    if (req.method === "GET") {
      const data = await loadPortfolioData();
      return Response.json(sortWorks(data.works));
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!body.title) {
        return Response.json({ error: "Title is required" }, { status: 400 });
      }
      const data = await loadPortfolioData({ forWrite: true });
      const created = buildWorkFromBody(body, nextId(data.works));
      data.works.push(created);
      await savePortfolioData(data);
      return Response.json(created, { status: 201 });
    }

    if (id == null || Number.isNaN(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      const data = await loadPortfolioData({ forWrite: true });
      const index = data.works.findIndex((work) => Number(work.id) === id);
      if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });
      const updated = buildWorkFromBody({ ...data.works[index], ...body }, id);
      data.works[index] = updated;
      await savePortfolioData(data);
      return Response.json(updated);
    }

    if (req.method === "DELETE") {
      const data = await loadPortfolioData({ forWrite: true });
      const index = data.works.findIndex((work) => Number(work.id) === id);
      if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });
      data.works.splice(index, 1);
      await savePortfolioData(data);
      return Response.json({ success: true });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    return errorResponse(error);
  }
};

export const config: Config = {
  path: ["/api/works", "/api/works/:id"],
};
