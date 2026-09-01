import { createFileRoute } from "@tanstack/react-router";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { createInitialState } from "@/lib/seed";
import { buildDocx, wordFilename } from "@/lib/export-docx";

const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const files = new Map<string, { bytes: Uint8Array; filename: string; type: string }>();
const EXPORT_DIR = join(process.cwd(), "public", "exports");

// Carpeta universitaria del usuario donde se guardan los archivos físicos
const UNI_DIR = "C:/Users/andre/OneDrive/Escritorio/UNIVERSIDAD/8 SEMESTRE/AUDITORIA DE SISTEMA";

function getDynamicFilename() {
  return wordFilename("EAAB");
}

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

/** Cierra Microsoft Word automáticamente si está bloqueando un archivo */
function closeWordProcess() {
  try {
    execSync("taskkill /F /IM WINWORD.EXE", { stdio: "pipe" });
    console.log("[api/word] Microsoft Word cerrado automáticamente para liberar archivos bloqueados.");
    return true;
  } catch {
    return false; // Word no estaba abierto o no se pudo cerrar
  }
}

/** Escribe un archivo en disco, cerrando Word automáticamente si está bloqueado */
async function writeFileSafe(filePath: string, data: Uint8Array) {
  try {
    await writeFile(filePath, data);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EBUSY" || code === "EPERM") {
      console.warn(`[api/word] Archivo bloqueado: ${filePath}. Cerrando Word...`);
      closeWordProcess();
      await new Promise((r) => setTimeout(r, 1500)); // esperar que Word libere
      await writeFile(filePath, data); // reintentar
    } else {
      throw err;
    }
  }
}

let latestInMemory: Uint8Array | null = null;

async function persist(bytes: Uint8Array, filename: string) {
  latestInMemory = bytes;
  try {
    await mkdir(EXPORT_DIR, { recursive: true });
    await writeFileSafe(join(EXPORT_DIR, asciiFilename(filename)), bytes);
    await writeFileSafe(join(EXPORT_DIR, getDynamicFilename()), bytes);
  } catch (err) {
    console.warn("[api/word] No se pudo escribir en disco de exports:", err);
  }
  // También guardar en la carpeta universitaria del usuario
  try {
    const dynName = getDynamicFilename();
    await writeFileSafe(join(UNI_DIR, dynName), bytes);
    await writeFileSafe(join(UNI_DIR, "Bitacora_EAAB_2026-08-24.docx"), bytes);
    await writeFileSafe(join(UNI_DIR, "Bitacora_EAAB_Optimizada_2026-08-24.docx"), bytes);
    console.log("[api/word] Archivos actualizados en carpeta universitaria:", dynName);
  } catch (err) {
    console.warn("[api/word] No se pudo escribir en carpeta universitaria:", err);
  }
}


async function latestFromDisk() {
  if (latestInMemory) return latestInMemory;
  try {
    const bytes = new Uint8Array(await readFile(join(EXPORT_DIR, getDynamicFilename())));
    latestInMemory = bytes;
    return bytes;
  } catch {
    return null;
  }
}

async function seedDocx() {
  const blob = await buildDocx(createInitialState());
  const bytes = new Uint8Array(await blob.arrayBuffer());
  await persist(bytes, getDynamicFilename());
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
        const filename = asciiFilename(String(form.get("filename") || getDynamicFilename()));
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
        if (disk) return attachment(disk, getDynamicFilename());
        const generated = await seedDocx();
        return attachment(generated, getDynamicFilename());
      },
    },
  },
});
