import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SOURCE_TYPE_LABEL } from "@/lib/seed";
import { classifyOfficial, requestUrlCheck } from "@/lib/official-url";
import { todayISO, useBitacora } from "@/lib/store";
import type { SectionId, SourceType } from "@/lib/types";

export function FindingForm({
  defaultSection,
  onDone,
}: {
  defaultSection?: SectionId;
  onDone?: () => void;
}) {
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const team = useBitacora((s) => s.team);
  const addFinding = useBitacora((s) => s.addFinding);
  const addSource = useBitacora((s) => s.addSource);

  const named = team.find((m) => m.name.trim());
  const [date, setDate] = useState(todayISO());
  const [author, setAuthor] = useState(named?.name || "Equipo");
  const [sectionId, setSectionId] = useState<SectionId>(defaultSection ?? "empresa");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("oficial");
  const [alsoSource, setAlsoSource] = useState(true);
  const [urlHint, setUrlHint] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const url = sourceUrl.trim();
    setSaving(true);
    try {
      const check = url ? await requestUrlCheck(url) : undefined;
      if (url && !check?.official) {
        toast.error("Esa URL no es oficial (acueducto.com.co o .gov.co).", {
          description: check?.reason,
        });
        setUrlHint(check?.reason || "No oficial");
        return;
      }
      if (url && check && !check.live) {
        toast.error("El enlace oficial no respondió. Revísenlo antes de registrarlo.", {
          description: check.reason,
        });
        setUrlHint(check.reason);
        return;
      }
      addFinding({
        date,
        author: author.trim() || "Equipo",
        sectionId,
        title: title.trim(),
        content: content.trim(),
        sourceName: sourceName.trim() || "Fuente por confirmar",
        sourceUrl: url,
        sourceType,
      });
      if (alsoSource && sourceName.trim()) {
        addSource({
          name: sourceName.trim(),
          url,
          type: sourceType,
          consultedAt: date,
          notes: title.trim(),
          check,
        });
      }
      setTitle("");
      setContent("");
      setSourceUrl("");
      setUrlHint("");
      onDone?.();
    } finally {
      setSaving(false);
    }
  }

  const field = "flex flex-col gap-1.5";
  const selectCls =
    "h-11 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={field}>
          <Label htmlFor="f-date">Fecha</Label>
          <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={field}>
          <Label htmlFor="f-author">Quién investigó</Label>
          <Input
            id="f-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nombre"
          />
        </div>
      </div>
      <div className={field}>
        <Label htmlFor="f-sec">Sección del tablero</Label>
        <select
          id="f-sec"
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
      <div className={field}>
        <Label htmlFor="f-title">Qué se encontró</Label>
        <Input
          id="f-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. ISO 14001 recertificada en 2025"
          required
        />
      </div>
      <div className={field}>
        <Label htmlFor="f-body">Nota de bitácora</Label>
        <Textarea
          id="f-body"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dato, cifra o cita. Si es textual, entre comillas."
          required
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={field}>
          <Label htmlFor="f-src">Nombre de la fuente</Label>
          <Input
            id="f-src"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Reporte Integrado 2025"
          />
        </div>
        <div className={field}>
          <Label htmlFor="f-type">Tipo</Label>
          <select
            id="f-type"
            className={selectCls}
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
          >
            {Object.entries(SOURCE_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={field}>
        <Label htmlFor="f-url">URL oficial</Label>
        <Input
          id="f-url"
          type="url"
          value={sourceUrl}
          onChange={(e) => {
            const v = e.target.value;
            setSourceUrl(v);
            if (!v.trim()) {
              setUrlHint("");
              return;
            }
            setUrlHint(classifyOfficial(v).reason);
          }}
          placeholder="https://www.acueducto.com.co/..."
        />
        {urlHint ? <p className="text-[12px] text-muted">{urlHint}</p> : null}
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={alsoSource}
          onChange={(e) => setAlsoSource(e.target.checked)}
          className="size-4 accent-accent"
        />
        Agregar también a la bibliografía
      </label>
      <Button type="submit" disabled={saving}>
        {saving ? "Validando URL…" : "Registrar hallazgo"}
      </Button>
    </form>
  );
}
