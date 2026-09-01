import { useState } from "react";
import { toast } from "sonner";
import { fetchAndSaveWord, saveWordToPc, wordHref } from "./save-file";
import { useBitacora } from "./store";

export function useExportWord() {
  const [busy, setBusy] = useState(false);

  async function exportWord() {
    setBusy(true);
    try {
      const { buildDocx, publishBlob, wordFilename } = await import("./export-docx");
      const state = useBitacora.getState();
      const blob = await buildDocx(state);
      const filename = wordFilename(state.company.shortName);
      await publishBlob(blob, filename);
      useBitacora.getState().markExported();
      useBitacora.getState().setLastDownload({ href: "/api/word", filename });
      const via = await saveWordToPc(blob, filename);
      if (via === "guardado") {
        toast.success("Documento Word (.docx) descargado con éxito");
      } else {
        toast.success("Descarga iniciada. Si no bajó, abre el enlace:", {
          description: wordHref(),
        });
      }
    } catch (err) {
      console.error(err);
      try {
        await fetchAndSaveWord();
        toast.success("Se abrió el Word ya generado.");
      } catch {
        toast.error("No se pudo generar. Usa el enlace Descargar Word.");
      }
    } finally {
      setBusy(false);
    }
  }

  return { busy, exportWord };
}
