import { useState, type FormEvent } from "react";
import { Search, ShieldCheck, Sparkles, FilePlus2, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvestigateHit, InvestigateResponse } from "@/lib/investigate";
import { checkLabel } from "@/lib/official-url";
import { todayISO, useBitacora } from "@/lib/store";
import type { SectionId } from "@/lib/types";

const SECTION_SUGGESTIONS: Record<string, string[]> = {
  empresa: ["NIT y domicilio", "Misión y visión", "Naturaleza jurídica"],
  mision: ["Misión institucional", "Visión y valores", "Transparencia"],
  vision: ["Visión corporativa", "Direccionamiento", "Misión EAAB"],
  valores: ["Valores corporativos", "Código de integridad", "Honestidad y respeto"],
  organigrama: ["Organigrama PDF", "Gerente General", "Estructura orgánica"],
  legal: ["Ley 142 de 1994", "Ley 1712 de 2014", "Acuerdo de Junta Directiva"],
  ambiental: ["Decreto 1076 de 2015", "Ley 99 de 1993", "ISO 14001", "PIGA"],
  partes: ["Grupos de interés", "Responsabilidad social", "RSE EAAB"],
  manual: ["Manual de funciones", "Mapas de procesos", "Resolución de cargos"],
  financieros: ["Estados financieros", "Planeación presupuesto", "Informes financieros"],
  politicas: ["Código de integridad", "Manual SUG", "Política ambiental", "Contratación"],
};

export function InvestigatePanel({ defaultSection }: { defaultSection?: SectionId }) {
  const company = useBitacora((s) => s.company);
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const team = useBitacora((s) => s.team);
  const addFinding = useBitacora((s) => s.addFinding);
  const addSource = useBitacora((s) => s.addSource);
  const updateSection = useBitacora((s) => s.updateSection);
  const named = team.find((m) => m.name.trim());

  const [query, setQuery] = useState("");
  const [sectionId, setSectionId] = useState<SectionId>(defaultSection ?? "politicas");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [hits, setHits] = useState<InvestigateHit[]>([]);
  const [added, setAdded] = useState<string[]>([]);
  const [inserted, setInserted] = useState<string[]>([]);

  const companyTag = company.shortName || "la entidad";
  const rawSuggestions = SECTION_SUGGESTIONS[sectionId] || [
    `Transparencia ${companyTag}`,
    "Ley 1712",
    "Estados financieros",
    "Código de ética",
  ];
  const suggestions = rawSuggestions.map((s) => s.replace("EAAB", companyTag));

  async function executeSearch(targetQuery: string) {
    if (targetQuery.trim().length < 3) return;
    setBusy(true);
    setHits([]);
    setNote("");
    try {
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: targetQuery.trim(),
          companyWebsite: company.website,
          companyName: company.shortName || company.legalName,
        }),
      });
      const data = (await res.json()) as InvestigateResponse & { error?: string };
      if (!res.ok) {
        toast.error(data.error || "No se pudo investigar.");
        return;
      }
      setHits(data.hits);
      setNote(data.note);
      if (data.hits.length === 0) toast.error(data.note);
    } catch (err) {
      console.error(err);
      toast.error("Falló la búsqueda. Intente de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function search(e: FormEvent) {
    e.preventDefault();
    await executeSearch(query);
  }

  function handleChipClick(sug: string) {
    setQuery(sug);
    void executeSearch(sug);
  }

  function addHit(hit: InvestigateHit) {
    if (!hit.check.official) {
      toast.error("Esa URL no es oficial.");
      return;
    }
    if (!hit.check.live) {
      toast.error("El enlace oficial no respondió.");
      return;
    }
    addFinding({
      date: todayISO(),
      author: named?.name || "Equipo",
      sectionId,
      title: hit.title,
      content: `Fuente oficial localizada y validada (${hit.check.reason}). Hub: ${hit.hub}.`,
      sourceName: hit.title,
      sourceUrl: hit.url,
      sourceType: hit.url.includes("funcionpublica.gov.co") ? "norma" : "oficial",
    });
    addSource({
      name: hit.title,
      url: hit.url,
      type: hit.url.includes("funcionpublica.gov.co") ? "norma" : "oficial",
      consultedAt: todayISO(),
      notes: `Investigar y añadir · ${hit.hub}`,
      check: hit.check,
    });
    setAdded((ids) => [...ids, hit.url]);
    toast.success("Añadido a la bitácora y fuentes APA", { description: hit.title });
  }

  function insertIntoSectionText(hit: InvestigateHit) {
    addHit(hit);
    const sec = sections[sectionId];
    if (!sec) return;

    const insertion = `\n\nFuente oficial consultada: ${hit.title}\nEnlace: ${hit.url}\nSoporte: Validado en ${hit.hub} (${hit.check.reason}).`;
    const newBody = sec.body ? `${sec.body.trim()}${insertion}` : insertion.trim();

    updateSection(sectionId, { body: newBody });
    setInserted((ids) => [...ids, hit.url]);
    toast.success("¡Texto insertado en la sección y Word!", {
      description: `Añadido al cuerpo de ${sec.shortTitle || sec.title}`,
    });
  }

  const selectCls =
    "h-11 rounded-sm border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-accent" />
        <h2 className="font-display text-xl text-ink">Asistente de Investigación Oficial 1-Click</h2>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Busca en vivo en los portales oficiales de {company.shortName || "la entidad auditada"} ({company.website || "web oficial"}), fuentes normativas y portales del Estado (.gov.co). Valida enlaces automáticamente y te permite insertarlos en el texto de la sección y en las citas APA 7 con 1 solo clic.
      </p>

      {/* Chips de sugerencias contextuales rápidas */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-faint mr-1">
          Sugerencias 1-Click:
        </span>
        {suggestions.map((sug) => (
          <button
            key={sug}
            type="button"
            disabled={busy}
            onClick={() => handleChipClick(sug)}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-sunken px-2.5 py-1 text-[12px] font-medium text-ink-soft hover:border-accent hover:bg-accent/10 hover:text-accent transition-colors"
          >
            <Search className="size-3" />
            {sug}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => void search(e)} className="mt-4 grid gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inv-q">Qué buscan (término o URL oficial)</Label>
          <Input
            id="inv-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. código de ética, estados financieros, Ley 1712, https://…"
          />
        </div>
        {defaultSection ? null : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inv-sec">Asignar a la sección</Label>
            <select
              id="inv-sec"
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
        <Button type="submit" disabled={busy || query.trim().length < 3}>
          <Search className="size-4" />
          {busy ? "Consultando portales oficiales en vivo…" : "Investigar en la web oficial"}
        </Button>
      </form>

      {note ? <p className="mt-3 text-[12px] text-muted">{note}</p> : null}

      {hits.length > 0 ? (
        <ul className="mt-4 space-y-3 border-t border-line pt-3">
          {hits.map((hit) => {
            const stamp = checkLabel(hit.check);
            const isAdded = added.includes(hit.url);
            const isInserted = inserted.includes(hit.url);

            return (
              <li key={hit.url} className="rounded-lg border border-line bg-bg-sunken/40 p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{hit.title}</p>
                    <p className="mt-0.5 text-[12px] text-faint">
                      {hit.hub} · {hit.check.reason}
                    </p>
                    <a
                      href={hit.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-[12px] text-accent underline-offset-2 hover:underline"
                    >
                      {hit.url}
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <Badge tone={stamp.tone}>{stamp.text}</Badge>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        disabled={isAdded || !hit.check.official || !hit.check.live}
                        onClick={() => addHit(hit)}
                        title="Añadir a la lista de hallazgos y fuentes"
                      >
                        <ShieldCheck className="size-3.5" />
                        {isAdded ? "Añadido" : "Añadir"}
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        disabled={isInserted || !hit.check.official || !hit.check.live}
                        onClick={() => insertIntoSectionText(hit)}
                        title="Insertar texto y enlace verificado en el cuerpo de la sección"
                      >
                        {isInserted ? (
                          <>
                            <Check className="size-3.5 text-emerald-600" />
                            Insertado
                          </>
                        ) : (
                          <>
                            <FilePlus2 className="size-3.5" />
                            Insertar en texto
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
