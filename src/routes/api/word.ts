import { createFileRoute } from "@tanstack/react-router";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInitialState } from "@/lib/seed";
import { buildDocx } from "@/lib/export-docx";

const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const files = new Map<string, { bytes: Uint8Array; filename: string; type: string }>();
const EXPORT_DIR = join(process.cwd(), "public", "exports");
const LATEST = "Bitacora_EAAB.docx";

function asciiFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

function attachment(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Response(copy.buffer, {
    headers: {
      "Content-Type": MIME,
      "Content-Disposition": `attachment; filename="${asciiFilename(filename)}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

let latestInMemory: Uint8Array | null = null;

async function persist(bytes: Uint8Array, filename: string) {
  latestInMemory = bytes;
  try {
    await mkdir(EXPORT_DIR, { recursive: true });
    await writeFile(join(EXPORT_DIR, asciiFilename(filename)), bytes);
    await writeFile(join(EXPORT_DIR, LATEST), bytes);
  } catch (err) {
    // Disk write might fail on serverless or read-only filesystems (e.g. Vercel)
    console.warn("[api/word] No se pudo escribir en disco, sirviendo desde memoria:", err);
  }
}

async function latestFromDisk() {
  if (latestInMemory) return latestInMemory;
  try {
    const bytes = new Uint8Array(await readFile(join(EXPORT_DIR, LATEST)));
    latestInMemory = bytes;
    return bytes;
  } catch {
    return null;
  }
}

async function seedDocx() {
  const blob = await buildDocx(createInitialState());
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await persist(bytes, LATEST);
  return bytes;
}

export const Route = createFileRoute("/api/word")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof Blob)) {
          return new Response("missing file", { status: 400 });
        }
        const filename = asciiFilename(String(form.get("filename") || LATEST));
        const id = crypto.randomUUID();
        const bytes = new Uint8Array(await file.arrayBuffer());
        files.set(id, { bytes, filename, type: MIME });
        if (files.size > 8) {
          const first = files.keys().next().value;
          if (first) files.delete(first);
        }
        await persist(bytes, filename);
        return Response.json({
          id,
          url: `/api/word?id=${encodeURIComponent(id)}`,
          latest: "/api/word",
        });
      },
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id");
        if (id) {
          const rec = files.get(id);
          if (rec) return attachment(rec.bytes, rec.filename);
        }
        const disk = await latestFromDisk();
        if (disk) return attachment(disk, LATEST);
        const generated = await seedDocx();
        return attachment(generated, LATEST);
      },
    },
  },
});
