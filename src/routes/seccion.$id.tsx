import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2, Settings, Save, Check, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FindingForm } from "@/components/finding-form";
import { OrgChart } from "@/components/org-chart";
import { EvidencePanel } from "@/components/evidence-panel";
import { InvestigatePanel } from "@/components/investigate-panel";
import { SourceLinks, TextWithLinks } from "@/components/source-links";
import { GeminiAssistantModal } from "@/components/gemini-assistant";
import { STATUS_LABEL, sourcesForSection } from "@/lib/seed";
import { useBitacora } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { SectionId, SectionStatus } from "@/lib/types";

export const Route = createFileRoute("/seccion/$id")({
  component: SectionPage,
});

function SectionPage() {
  const { id } = Route.useParams();
  const sectionId = id as SectionId;
  const section = useBitacora((s) => s.sections[sectionId]);
  const allFindings = useBitacora((s) => s.findings);
  const findings = allFindings.filter((f) => f.sectionId === sectionId);
  const orgChart = useBitacora((s) => s.orgChart);
  const allSources = useBitacora((s) => s.sources);
  const sectionSources = sourcesForSection(sectionId, allSources);
  const updateSection = useBitacora((s) => s.updateSection);
  const removeSection = useBitacora((s) => s.removeSection);
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const navigate = useNavigate();

  const [openFindingModal, setOpenFindingModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editBody, setEditBody] = useState(false);

  // Form states for full section editing
  const [titleInput, setTitleInput] = useState("");
  const [shortTitleInput, setShortTitleInput] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [summaryInput, setSummaryInput] = useState("");

  useEffect(() => {
    if (section) {
      setTitleInput(section.title);
      setShortTitleInput(section.shortTitle);
      setPromptInput(section.prompt);
      setSummaryInput(section.summary);
    }
  }, [section]);

  if (!section) throw notFound();

  const idx = sectionOrder.indexOf(sectionId);
  const prev = idx > 0 ? sectionOrder[idx - 1] : null;
  const next = idx >= 0 && idx < sectionOrder.length - 1 ? sectionOrder[idx + 1] : null;

  function handleSaveSectionMeta() {
    const t = titleInput.trim();
    if (!t) {
      toast.error("El título no puede estar vacío.");
      return;
    }
    const st = shortTitleInput.trim() || t.slice(0, 16);
    updateSection(sectionId, {
      title: t,
      shortTitle: st,
      prompt: promptInput.trim(),
      summary: summaryInput.trim(),
    });
    setOpenEditModal(false);
    toast.success("¡Sección y menú actualizados con éxito!");
  }

  function destroy() {
    if (!window.confirm(`¿Quitar la sección «${section.title}» y sus anexos de la bitácora?`)) return;
    const fallback = prev || next || "empresa";
    removeSection(sectionId);
    toast.success("Sección eliminada");
    void navigate({ to: "/seccion/$id", params: { id: fallback } });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-faint">
            Sección {idx + 1} de {sectionOrder.length}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl text-ink">{section.title}</h1>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-sm text-muted hover:bg-surface-2 hover:text-accent border border-line"
              onClick={() => setOpenEditModal(true)}
              title="Editar título, nombre corto y descripción de la sección"
              aria-label="Editar sección"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            tone={section.status === "validado" ? "ok" : section.status === "en_progreso" ? "warn" : "neutral"}
          >
            {STATUS_LABEL[section.status]}
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setOpenEditModal(true)}
          >
            <Settings className="size-3.5" />
            Editar Sección
          </Button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted">{section.prompt}</p>

      {/* Modal para Editar Título, Nombre Corto y Descripción de la Sección */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent
          title="Editar Información de la Sección"
          className="w-[min(560px,calc(100vw-1.5rem))] p-5 space-y-4"
        >
          <p className="text-xs text-faint -mt-2">
            Los cambios se reflejarán en el menú lateral, en la bitácora y en el documento Word.
          </p>

          <div className="space-y-3">
            <div>
              <Label htmlFor="sec-title" className="text-xs">
                Título Completo de la Sección
              </Label>
              <Input
                id="sec-title"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Ej. Estados Financieros y Auditoría 2024"
                className="mt-1 text-sm font-medium"
              />
            </div>

            <div>
              <Label htmlFor="sec-short" className="text-xs">
                Nombre Corto (para el Menú Lateral)
              </Label>
              <Input
                id="sec-short"
                value={shortTitleInput}
                onChange={(e) => setShortTitleInput(e.target.value)}
                placeholder="Ej. Financiero"
                className="mt-1 text-sm font-medium"
              />
              <p className="mt-0.5 text-[11px] text-faint">Este es el nombre visible en la barra lateral izquierda.</p>
            </div>

            <div>
              <Label htmlFor="sec-prompt" className="text-xs">
                Pregunta Orientadora / Objetivo
              </Label>
              <Input
                id="sec-prompt"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ej. Análisis de balances, ingresos y ejecución de la EAAB."
                className="mt-1 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="sec-summary" className="text-xs">
                Resumen Ejecutivo
              </Label>
              <Textarea
                id="sec-summary"
                rows={2}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder="Resumen del avance para la portada y el reporte Word..."
                className="mt-1 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={destroy}
            >
              <Trash2 className="size-3.5 mr-1" />
              Eliminar Sección
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpenEditModal(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveSectionMeta}
              >
                <Save className="size-3.5 mr-1" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SourceLinks sources={sectionSources} />

      <InvestigatePanel defaultSection={sectionId} />

      <div className="flex flex-wrap items-center gap-2">
        <Label className="mr-1">Estado</Label>
        {(["pendiente", "en_progreso", "validado"] as SectionStatus[]).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => updateSection(sectionId, { status: st })}
            className={
              section.status === st
                ? "h-9 rounded-full bg-accent px-3 text-[12px] text-accent-fg"
                : "h-9 rounded-full border border-line bg-surface px-3 text-[12px] text-ink-soft"
            }
          >
            {STATUS_LABEL[st]}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <GeminiAssistantModal
            defaultSectionId={sectionId}
            triggerVariant="secondary"
            triggerSize="sm"
            triggerLabel="Redactar con Gemini Pro"
          />
          <Dialog open={openFindingModal} onOpenChange={setOpenFindingModal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" />
                Hallazgo
              </Button>
            </DialogTrigger>
            <DialogContent title="Nuevo hallazgo">
              <FindingForm defaultSection={sectionId} onDone={() => setOpenFindingModal(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Guía Contextual: Qué hacer en esta sección */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs text-ink-soft space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-accent text-sm">
          <HelpCircle className="size-4" />
          <span>Guía de trabajo para esta sección</span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3 pt-1">
          <div className="rounded-lg bg-surface/80 p-2.5 border border-line/60 space-y-1">
            <span className="font-semibold text-ink flex items-center gap-1">1. Consulta fuentes</span>
            <p className="text-[11px] leading-relaxed">Revisa los enlaces oficiales verificados de la EAAB abajo o usa el Asistente de Investigación.</p>
          </div>
          <div className="rounded-lg bg-surface/80 p-2.5 border border-line/60 space-y-1">
            <span className="font-semibold text-ink flex items-center gap-1">2. Redacta y analiza</span>
            <p className="text-[11px] leading-relaxed">Usa <em>"Redactar con Gemini Pro"</em> o edita el texto para incluir antecedentes, cifras y citas APA.</p>
          </div>
          <div className="rounded-lg bg-surface/80 p-2.5 border border-line/60 space-y-1">
            <span className="font-semibold text-ink flex items-center gap-1">3. Adjunta y valida</span>
            <p className="text-[11px] leading-relaxed">Carga evidencias de soporte en Anexos y marca el estado en <em>Validado</em> para cerrar la sección.</p>
          </div>
        </div>
      </div>

      <article className="rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
          <p className="text-[13px] font-semibold text-accent uppercase tracking-wider">
            Contenido y Avance de la Sección (se incluye en el Word)
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-[13px] text-accent underline-offset-2 hover:underline font-medium"
              onClick={() => setEditBody((v) => !v)}
            >
              {editBody ? "Previsualizar texto" : "Editar texto de la sección"}
            </button>
          </div>
        </div>

        {editBody ? (
          <div className="mt-3 space-y-2">
            <Textarea
              className="min-h-56 font-sans text-sm leading-relaxed"
              value={section.body}
              onChange={(e) => updateSection(sectionId, { body: e.target.value })}
              placeholder="Escriban el avance: cifras, hallazgos, qué falta por subir…"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setEditBody(false); toast.success("Texto guardado con éxito."); }}>
                <Check className="size-3.5 mr-1" />
                Listo (Guardar texto)
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-soft">
            {section.body.split("\n\n").map((block, i) => (
              <TextWithLinks key={i} text={block} />
            ))}
          </div>
        )}

        {section.bullets.length > 0 ? (
          <ul className="mt-5 space-y-2 border-t border-line pt-4">
            {section.bullets.map((b) => (
              <li key={b} className="flex gap-2 text-sm text-ink">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      {sectionId === "organigrama" ? <OrgChart tree={orgChart} /> : null}

      <div className="rounded-xl border border-line bg-surface p-5 space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notes" className="font-semibold text-ink">Notas del equipo (entran al Word)</Label>
          <span className="text-[11px] text-faint">Se sincroniza automáticamente</span>
        </div>
        <Textarea
          id="notes"
          className="mt-1"
          value={section.notes}
          onChange={(e) => updateSection(sectionId, { notes: e.target.value })}
          placeholder="Dudas, datos por confirmar, reparto de tareas…"
        />
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              toast.success("¡Notas del equipo guardadas!");
            }}
          >
            <Check className="size-3.5 mr-1" />
            Guardar notas
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl">Hallazgos de esta sección</h2>
        {findings.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Aún no hay entradas. Registren cada fuente nueva.</p>
        ) : (
          <ol className="mt-3 space-y-4">
            {findings.map((f) => (
              <li key={f.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                <p className="text-[12px] text-faint">
                  {formatDate(f.date)} · {f.author}
                </p>
                <p className="font-medium text-ink">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.content}</p>
                {f.sourceUrl ? (
                  <a
                    href={f.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[13px] text-accent underline-offset-2 hover:underline"
                  >
                    {f.sourceName}
                  </a>
                ) : (
                  <p className="mt-1 text-[13px] text-muted">{f.sourceName}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <EvidencePanel defaultSection={sectionId} compact />

      <div className="flex items-center justify-between gap-3 pb-6">
        {prev ? (
          <Button variant="secondary" asChild>
            <Link to="/seccion/$id" params={{ id: prev }}>
              <ArrowLeft className="size-4" />
              {sections[prev]?.shortTitle ?? prev}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button variant="secondary" asChild>
            <Link to="/seccion/$id" params={{ id: next }}>
              {sections[next]?.shortTitle ?? next}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
