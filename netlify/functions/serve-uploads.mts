import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

export default async (req: Request, context: Context) => {
  const filename = context.params?.filename;
  if (!filename) return new Response("Not found", { status: 404 });

  const store = getStore("uploads");

  const data = await store.get(filename, { type: "arrayBuffer" });
  if (!data) return new Response("Not found", { status: 404 });

  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  return new Response(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = {
  path: "/uploads/:filename",
};
