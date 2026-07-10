import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = "general";

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: "File type not allowed. Use jpg, png, or webp." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const buffer = await file.arrayBuffer();

    const store = getStore("uploads");
    await store.set(filename, new Uint8Array(buffer), {
      metadata: {
        originalName: file.name,
        contentType: file.type,
        category,
        uploadedAt: new Date().toISOString(),
      },
    });

    return Response.json({
      success: true,
      path: `/uploads/${filename}`,
      filename,
      originalName: file.name,
      category,
    });
  }

  return Response.json({ error: "Content type must be multipart/form-data" }, { status: 400 });
};

export const config: Config = {
  path: "/api/upload",
};
