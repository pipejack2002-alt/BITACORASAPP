import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { AlertTriangle, Copy, Eye, FileText, Paperclip, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ATTACHMENT_KIND_LABEL } from "@/lib/seed";
import { extractTextFromFile, kindFromFile } from "@/lib/extract-text";
import { getBlob, saveBlob } from "@/lib/files-idb";
import { useBitacora } from "@/lib/store";
import { formatBytes, formatDateTime } from "@/lib/utils";
import { GeminiAssistantModal } from "@/components/gemini-assistant";
import type { Attachment, SectionId } from "@/lib/types";

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

export function EvidencePanel({
  defaultSection,
  compact = false,
}: {
  defaultSection?: SectionId;
  compact?: boolean;
}) {
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const team = useBitacora((s) => s.team);
  const all = useBitacora((s) => s.attachments);
  const addAttachment = useBitacora((s) => s.addAttachment);
  const updateAttachment = useBitacora((s) => s.updateAttachment);
  const removeAttachment = useBitacora((s) => s.removeAttachment);

  const named = team.find((m) => m.name.trim());
  const [sectionId, setSectionId] = useState<SectionId>(defaultSection ?? "financieros");
  const [author, setAuthor] = useState(named?.name || "Equipo");
  const [title, setTitle] = useState("");
  const [paste, setPaste] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const rawList = useMemo(
    () =>
      (defaultSection ? all.filter((a) => a.sectionId === defaultSection) : all).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [all, defaultSection],
  );

  const list = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rawList;
    return rawList.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.fileName && a.fileName.toLowerCase().includes(q)) ||
        a.notes.toLowerCase().includes(q) ||
        a.extractedText.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q),
    );
  }, [rawList, searchQuery]);

  async function ingestFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("El archivo supera 20 MB. Péguen el párrafo o suban un extracto.");
      return;
    }
    setBusy(true);
    try {
      const extracted = await extractTextFromFile(file);
      const kind = kindFromFile(file);
      const id = addAttachment({
        sectionId,
        title: title.trim() || file.name.replace(/\.[^.]+$/, ""),
        kind,
        fileName: file.name,
        mime: file.type || "application/octet-stream",
        size: file.size,
        hasFile: true,
        extractedText: extracted,
        notes: notes.trim(),
        author: author.trim() || "Equipo",
      });
      await saveBlob(id, file);
      toast.success(extracted ? "Archivo cargado y texto extraído" : "Archivo cargado", {
        description: extracted
          ? "El extracto entra al Word. Revísenlo y recorten si hace falta."
          : "No se detectó texto seleccionable (posible PDF escaneado). Puedes transcribir o pegar los párrafos clave.",
      });
      setTitle("");
      setNotes("");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo leer el archivo.");
    } finally {
      setBusy(false);
    }
  }

  function submitPaste(e: FormEvent) {
    e.preventDefault();
    if (!paste.trim()) return;
    addAttachment({
      sectionId,
      title: title.trim() || "Texto pegado",
      kind: "texto",
      fileName: "",
      mime: "text/plain",
      size: paste.trim().length,
      hasFile: false,
      extractedText: paste.trim(),
      notes: notes.trim(),
      author: author.trim() || "Equipo",
    });
    toast.success("Texto registrado en la bitácora");
    setPaste("");
    setTitle("");
    setNotes("");
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void ingestFile(file);
  }

  const field = "flex flex-col gap-1.5";
  const selectCls =
    "h-11 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl text-ink">Evidencia para auditar</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Suban el PDF o Word (estados financieros, políticas, SIG) o peguen el párrafo.
          El texto extraído queda en esta bitácora y sale en el Word.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {defaultSection ? null : (
            <div className={field}>
              <Label htmlFor="ev-sec">Sección</Label>
              <select
                id="ev-sec"
                className={selectCls}
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value as SectionId)}
              >
                {sectionOrder.map((id) => (
                  <option key={id} value={id}>
                    {sections[id]?.title ?? id}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={field}>
            <Label htmlFor="ev-author">Quién carga</Label>
            <Input id="ev-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className={field}>
            <Label htmlFor="ev-title">Título (opcional)</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Estado de resultados 2025"
            />
          </div>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={
            drag
              ? "mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-accent bg-accent-soft px-4 py-6 text-center"
              : "mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface-2 px-4 py-6 text-center"
          }
        >
          <Upload className="size-5 text-accent" />
          <span className="mt-2 text-sm font-medium text-ink">
            {busy ? "Leyendo archivo…" : "Soltar PDF o Word, o tocar para elegir"}
          </span>
          <span className="mt-1 text-[12px] text-muted">Hasta 20 MB · se extrae el texto al cargar</span>
          <input
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void ingestFile(file);
            }}
          />
        </label>

        <form onSubmit={submitPaste} className="mt-4 grid gap-3">
          <div className={field}>
            <Label htmlFor="ev-paste">O pegar un párrafo / cifra</Label>
            <Textarea
              id="ev-paste"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Copien del PDF oficial y péguen aquí. Incluyan período y unidad (miles o millones de pesos)."
            />
          </div>
          {compact ? null : (
            <div className={field}>
              <Label htmlFor="ev-notes">Notas de auditoría</Label>
              <Input
                id="ev-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Año, página, tipo de estado, acta de política…"
              />
            </div>
          )}
          <Button type="submit" variant="secondary" disabled={!paste.trim()}>
            Registrar texto pegado
          </Button>
        </form>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg text-ink">
            {defaultSection ? "Anexos de esta sección" : "Todos los anexos"} ({rawList.length})
          </h3>
          {rawList.length > 2 ? (
            <div className="relative w-full max-w-xs sm:w-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                type="search"
                placeholder="Buscar en anexos y textos…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
          ) : null}
        </div>

        {list.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            {searchQuery ? "No hay anexos que coincidan con la búsqueda." : "Aún no hay archivos ni textos pegados."}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {list.map((a) => (
              <AttachmentRow
                key={a.id}
                item={a}
                sectionLabel={sections[a.sectionId]?.shortTitle ?? a.sectionId}
                showSection={!defaultSection}
                onNotes={(notes) => updateAttachment(a.id, { notes })}
                onText={(extractedText) => updateAttachment(a.id, { extractedText })}
                onRemove={() => removeAttachment(a.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AttachmentRow({
  item,
  sectionLabel,
  showSection,
  onNotes,
  onText,
  onRemove,
}: {
  item: Attachment;
  sectionLabel: string;
  showSection: boolean;
  onNotes: (v: string) => void;
  onText: (v: string) => void;
  onRemove: () => void;
  }) {
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  async function openPreview() {
    if (item.hasFile) {
      const blob = await getBlob(item.id);
      if (!blob) {
        toast.error("El archivo ya no está en este navegador.");
        return;
      }
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    }
    setPreviewOpen(true);
  }

  function handleClosePreview() {
    setPreviewOpen(false);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  }

  const isScannedPdf = item.hasFile && item.kind === "pdf" && !item.extractedText.trim();

  return (
    <li className="rounded-lg border border-line p-3">
      <div className="flex items-start gap-2">
        <Paperclip className="mt-1 size-4 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink">{item.title}</p>
          <p className="text-[12px] text-faint">
            {ATTACHMENT_KIND_LABEL[item.kind]}
            {showSection ? ` · ${sectionLabel}` : ""}
            {item.fileName ? ` · ${item.fileName}` : ""}
            {item.hasFile ? ` · ${formatBytes(item.size)}` : ""}
            {` · ${formatDateTime(item.createdAt)} · ${item.author}`}
          </p>
          {item.notes ? <p className="mt-1 text-sm text-ink-soft">{item.notes}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <GeminiAssistantModal
            defaultSectionId={item.sectionId}
            initialContext={`[Documento / Anexo: ${item.title}]\n[Archivo: ${item.fileName || "Texto pegado"}]\n[Extracto del contenido]:\n${item.extractedText || item.notes || item.title}`}
            initialPrompt={`Analiza este documento «${item.title}» de la EAAB-ESP. Extrae los hallazgos principales, cifras financieras o normatividad aplicable para incorporarlos a la bitácora y al documento Word.`}
            triggerVariant="secondary"
            triggerSize="sm"
            triggerLabel="Analizar con Gemini Pro"
          />
          <Button size="sm" variant="secondary" type="button" onClick={() => void openPreview()}>
            <Eye className="size-4" />
            Ver
          </Button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-sm text-faint hover:bg-bg-sunken hover:text-danger"
            onClick={onRemove}
            aria-label="Eliminar anexo"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {isScannedPdf ? (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-warn/30 bg-warn/10 p-2.5 text-xs text-ink">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
          <div>
            <span className="font-semibold text-warn">PDF escaneado detectado:</span> Este documento no contiene texto seleccionable. Usa el formulario de arriba para transcribir o pegar los párrafos y cifras clave que deban salir en el Word.
          </div>
        </div>
      ) : null}

      {item.extractedText ? (
        <div className="mt-2">
          <button
            type="button"
            className="text-[13px] text-accent underline-offset-2 hover:underline"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Ocultar extracto" : "Ver / editar extracto"}
          </button>
          {open ? (
            <Textarea
              className="mt-2 min-h-32"
              value={item.extractedText}
              onChange={(e) => onText(e.target.value)}
            />
          ) : (
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-soft">{item.extractedText}</p>
          )}
        </div>
      ) : null}

      <Input
        className="mt-2"
        value={item.notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Notas: período, página, acta…"
      />

      {/* Visor Modal de Evidencia */}
      <Dialog open={previewOpen} onOpenChange={(v) => (!v ? handleClosePreview() : setPreviewOpen(true))}>
        <DialogContent
          title={item.title || "Previsualización de anexo"}
          className="w-[min(900px,calc(100vw-2rem))] max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-xs text-muted">
              <span>
                {ATTACHMENT_KIND_LABEL[item.kind]} · {item.fileName || "Texto cargado"} · {formatDateTime(item.createdAt)}
              </span>
              {previewBlobUrl ? (
                <a
                  href={previewBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  <FileText className="size-3.5" />
                  Abrir en pestaña nueva
                </a>
              ) : null}
            </div>

            {previewBlobUrl && item.kind === "pdf" ? (
              <div className="h-[60vh] w-full overflow-hidden rounded-md border border-line bg-surface-2">
                <iframe
                  src={previewBlobUrl}
                  title={item.title}
                  className="size-full border-0"
                />
              </div>
            ) : null}

            {item.extractedText ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                    Texto Extraído / Contenido
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(item.extractedText);
                      toast.success("Texto copiado al portapapeles");
                    }}
                  >
                    <Copy className="size-3.5" />
                    Copiar texto
                  </Button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto rounded-md border border-line bg-surface-2 p-3 font-mono text-xs leading-relaxed text-ink">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{item.extractedText}</pre>
                </div>
              </div>
            ) : null}

            {isScannedPdf ? (
              <div className="rounded-md border border-warn/30 bg-warn/10 p-3 text-sm text-ink">
                <p className="font-semibold text-warn">Documento escaneado</p>
                <p className="mt-1 text-xs text-ink-soft">
                  El visor superior muestra el PDF original. Puedes leerlo y transcribir las cifras o textos en el campo de notas o texto pegado.
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </li>
  );
}
