import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  if (req.method === "GET") {
    const store = getStore("uploads");
    const { blobs } = await store.list();
    const media = await Promise.all(
      blobs.map(async (blob) => {
        const meta = await store.getMetadata(blob.key);
        return {
          key: blob.key,
          url: `/uploads/${blob.key}`,
          originalName: meta?.metadata?.originalName || blob.key,
          contentType: meta?.metadata?.contentType || "image/jpeg",
          category: meta?.metadata?.category || "general",
          uploadedAt: meta?.metadata?.uploadedAt || "",
        };
      })
    );
    return Response.json(media);
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!key) return Response.json({ error: "Key is required" }, { status: 400 });
    const store = getStore("uploads");
    await store.delete(key);
    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/media",
};
