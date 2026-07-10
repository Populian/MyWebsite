import type { Config } from "@netlify/functions";
import { loadPortfolioData, savePortfolioData } from "./_shared/blob-data.mjs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected API error";
  console.error(message, error);
  return Response.json({ error: message }, { status: 500 });
}

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      const data = await loadPortfolioData();
      return Response.json(data.site);
    }

    if (req.method === "POST") {
      const body = await req.json();
      const data = await loadPortfolioData({ forWrite: true });
      const updated: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(body)) {
        const current = data.site[key];
        if (
          current &&
          typeof current === "object" &&
          !Array.isArray(current) &&
          value &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          data.site[key] = { ...current, ...value };
        } else {
          data.site[key] = value;
        }
        updated[key] = data.site[key];
      }

      await savePortfolioData(data);
      return Response.json({ success: true, updated });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    return errorResponse(error);
  }
};

export const config: Config = {
  path: "/api/site",
};
