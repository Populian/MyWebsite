import type { Config } from "@netlify/functions";
import { loadPortfolioData, loadSeedData, savePortfolioData } from "./_shared/blob-data.mjs";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected API error";
  console.error(message, error);
  return Response.json({ error: message }, { status: 500 });
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";
    const existing = await loadPortfolioData();

    if (existing.works.length > 0 && !force) {
      return Response.json({ message: "Data already exists. Use force=true to overwrite.", seeded: false });
    }

    const seeded = await loadSeedData();
    await savePortfolioData(seeded);
    return Response.json({
      success: true,
      seeded: true,
      works: seeded.works.length,
      schedule: seeded.schedule.length,
      configs: Object.keys(seeded.site).length,
    });
  } catch (error) {
    return errorResponse(error);
  }
};

export const config: Config = {
  path: "/api/seed",
};
