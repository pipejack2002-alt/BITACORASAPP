const MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function askParentToDownload(filename: string, base64: string) {
  try {
    window.parent?.postMessage(
      {
        channel: "grok-preview-bridge",
        version: 1,
        type: "download",
        filename,
        mime: MIME,
        base64,
      },
      "*",
    );
  } catch {
    /* parent may ignore */
  }
}

function clickLink(href: string, opts: { download?: string; target?: string }) {
  const a = document.createElement("a");
  a.href = href;
  if (opts.download) a.download = opts.download;
  if (opts.target) {
    a.target = opts.target;
    a.rel = "noreferrer";
  }
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function wordHref() {
  return new URL("/api/word", window.location.origin).href;
}

export async function saveWordToPc(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: MIME });

  const w = window as Window & {
    showSaveFilePicker?: (opts: {
      suggestedName: string;
      types: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };

  if (typeof w.showSaveFilePicker === "function") {
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: "Microsoft Word", accept: { [MIME]: [".docx"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "guardado";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelado";
    }
  }

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return "compartido";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelado";
    }
  }

  try {
    const base64 = arrayBufferToBase64(await blob.arrayBuffer());
    askParentToDownload(filename, base64);
  } catch {
    /* ignore */
  }

  const blobUrl = URL.createObjectURL(file);
  clickLink(blobUrl, { download: filename });
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);

  const abs = wordHref();
  clickLink(abs, { download: filename, target: "_blank" });
  clickLink(abs, { target: "_top" });

  try {
    await navigator.clipboard.writeText(abs);
  } catch {
    /* ignore */
  }

  return "enlace";
}

export async function fetchAndSaveWord(filename = "Bitacora_EAAB.docx") {
  const res = await fetch("/api/word", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo leer el Word");
  const blob = await res.blob();
  return saveWordToPc(blob, filename);
}
