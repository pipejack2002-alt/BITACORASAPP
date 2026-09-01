const MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function wordHref() {
  return new URL("/api/word", window.location.origin).href;
}

export async function saveWordToPc(blob: Blob, filename: string) {
  try {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    return "guardado";
  } catch (err) {
    console.error("Error al descargar archivo local:", err);
    return "enlace";
  }
}

export async function fetchAndSaveWord(filename = "Bitacora_EAAB_2026-08-31.docx") {
  const res = await fetch("/api/word", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo leer el Word");
  const blob = await res.blob();
  return saveWordToPc(blob, filename);
}
