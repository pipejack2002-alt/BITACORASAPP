import { useState } from "react";
import {
  Sparkles,
  Key,
  Send,
  Copy,
  FilePlus2,
  BookmarkPlus,
  ExternalLink,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { todayISO, useBitacora } from "@/lib/store";
import type { SectionId } from "@/lib/types";

const GEMINI_MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash (Recomendado)", desc: "Alta velocidad, máxima estabilidad y análisis formal de la EAAB" },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", desc: "Última generación con razonamiento avanzado" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", desc: "Rendimiento balanceado y respuestas rápidas" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", desc: "Modo ultra ligero" },
];

export function GeminiAssistantModal({
  defaultSectionId,
  initialContext,
  initialPrompt,
  triggerLabel,
  triggerVariant = "default",
  triggerSize = "default",
  triggerClassName,
}: {
  defaultSectionId?: SectionId;
  initialContext?: string;
  initialPrompt?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "secondary" | "ghost" | "danger";
  triggerSize?: "default" | "sm" | "lg";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const company = useBitacora((s) => s.company);
  const geminiApiKey = useBitacora((s) => s.geminiApiKey || "");
  const geminiModel = useBitacora((s) => s.geminiModel || "gemini-3.6-flash");
  const setGeminiKey = useBitacora((s) => s.setGeminiKey);
  const setGeminiModel = useBitacora((s) => s.setGeminiModel);
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const updateSection = useBitacora((s) => s.updateSection);
  const addFinding = useBitacora((s) => s.addFinding);
  const team = useBitacora((s) => s.team);
  const named = team.find((m) => m.name.trim());

  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [context, setContext] = useState(initialContext || "");
  const [selectedSection, setSelectedSection] = useState<SectionId>(
    defaultSectionId || "empresa",
  );
  const [keyInput, setKeyInput] = useState(geminiApiKey);
  const [showKeyConfig, setShowKeyConfig] = useState(!geminiApiKey);
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState("");

  const compLabel = company.shortName || company.legalName || "la entidad auditada";

  const quickPrompts = [
    {
      label: "📝 Redactar análisis de sección",
      text: `Elabora una redacción analítica, formal y académica sobre la sección «${sections[selectedSection]?.title || selectedSection}» de ${compLabel}. Incluye antecedentes, importancia estratégica y marco regulatorio correspondiente.`,
    },
    {
      label: "📊 Resumir cifras clave y estado",
      text: `Extrae y organiza en viñetas claras los datos numéricos, fechas, acuerdos y resoluciones más importantes de ${compLabel} mencionados en el contexto.`,
    },
    {
      label: "🎯 Matriz DOFA Estratégica",
      text: `Estructura una matriz DOFA (Fortalezas, Oportunidades, Debilidades, Amenazas) rigurosa para ${compLabel} con base en su sector (${company.sector || "su actividad"}), sus procesos y riesgos operativos de TI.`,
    },
    {
      label: "⚖️ Marco Normativo y de Control",
      text: `Sintetiza cómo aplica el marco normativo (Ley 43 de 1990, Ley 1581 de 2012, normas sectoriales y entes de control) a la operación y auditoría de ${compLabel}.`,
    },
  ];

  async function handleGenerate(customPrompt?: string) {
    const textToAsk = customPrompt || prompt;
    if (!textToAsk.trim()) {
      toast.error("Escribe una instrucción o pregunta para Gemini.");
      return;
    }

    if (!geminiApiKey && !keyInput.trim()) {
      setShowKeyConfig(true);
      toast.error("Por favor ingresa tu API Key de Gemini para continuar.");
      return;
    }

    const activeKey = geminiApiKey || keyInput.trim();
    if (keyInput.trim() && keyInput.trim() !== geminiApiKey) {
      setGeminiKey(keyInput.trim());
    }

    setBusy(true);
    setResponse("");

    try {
      const activeSec = sections[selectedSection];
      const secContext = context.trim() || activeSec?.body || "";

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToAsk.trim(),
          context: secContext,
          sectionTitle: activeSec?.title || selectedSection,
          company,
          model: geminiModel,
          apiKey: activeKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresKey) setShowKeyConfig(true);
        toast.error(data.error || "No se pudo conectar con Gemini.");
        return;
      }

      setResponse(data.text);
      toast.success("¡Respuesta generada por Gemini Pro!", {
        description: `Modelo: ${data.model}`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al comunicarse con Gemini. Revisa tu conexión a internet.");
    } finally {
      setBusy(false);
    }
  }

  function handleSaveKey() {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      toast.error("La clave no puede estar vacía.");
      return;
    }
    setGeminiKey(trimmed);
    setShowKeyConfig(false);
    toast.success("Clave de Gemini guardada con éxito en tu navegador.");
  }

  function handleInsertIntoSection() {
    const sec = sections[selectedSection];
    if (!sec || !response) return;

    const insertion = `\n\n[Análisis generado con Gemini Pro]\n${response.trim()}`;
    const newBody = sec.body ? `${sec.body.trim()}${insertion}` : insertion.trim();

    updateSection(selectedSection, { body: newBody });
    toast.success("¡Texto insertado en la sección y en el Word!", {
      description: `Sección: ${sec.shortTitle || sec.title}`,
    });
  }

  function handleCreateFinding() {
    if (!response) return;
    const sec = sections[selectedSection];

    addFinding({
      date: todayISO(),
      author: named?.name ? `${named.name} (vía Gemini Pro)` : "Equipo (vía Gemini Pro)",
      sectionId: selectedSection,
      title: `Análisis asistido con Gemini: ${sec?.shortTitle || selectedSection}`,
      content: response.slice(0, 350) + (response.length > 350 ? "…" : ""),
      sourceName: "Google Gemini Pro AI Assistant",
      sourceUrl: "https://aistudio.google.com/",
      sourceType: "otro",
    });

    toast.success("Hallazgo registrado en la Bitácora", {
      description: `Asignado a ${sec?.shortTitle || selectedSection}`,
    });
  }

  function handleCopy() {
    if (!response) return;
    void navigator.clipboard.writeText(response);
    toast.success("Copiado al portapapeles");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
        >
          <Sparkles className="size-4 text-emerald-600 animate-pulse" />
          {triggerLabel || "Asistente Gemini Pro"}
        </Button>
      </DialogTrigger>

      <DialogContent
        title="Asistente IA Google Gemini Pro"
        className="w-[min(640px,calc(100vw-1.5rem))] max-h-[88vh] overflow-y-auto p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 -mt-2">
          <p className="text-[12px] text-faint">
            Copiloto de investigación, redacción y análisis de la EAAB-ESP
          </p>
          <div className="flex items-center gap-2">
            <Badge tone={geminiApiKey ? "ok" : "warn"}>
              {geminiApiKey ? "API Key Activa" : "Requiere API Key"}
            </Badge>
            <button
              type="button"
              onClick={() => setShowKeyConfig((v) => !v)}
              className="rounded p-1.5 text-muted hover:bg-bg-sunken hover:text-ink"
              title="Configurar API Key y Modelo"
            >
              <Key className="size-4" />
            </button>
          </div>
        </div>

        {/* Sección de Configuración de API Key y Modelo */}
        {showKeyConfig ? (
          <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                Configuración de Gemini
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
              >
                Obtener API Key Gratis en Google AI Studio
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="gemini-key" className="text-xs">
                Google Gemini API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="gemini-key"
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Pega tu clave AIzaSy..."
                  className="font-mono text-xs"
                />
                <Button size="sm" onClick={handleSaveKey}>
                  Guardar Clave
                </Button>
              </div>
              <p className="text-[11px] text-faint">
                Tu clave se almacena de forma privada en tu navegador (localStorage) y nunca se comparte públicamente.
              </p>
            </div>

            <div className="grid gap-1 pt-1">
              <Label htmlFor="gemini-model" className="text-xs">
                Modelo de Gemini
              </Label>
              <select
                id="gemini-model"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="h-9 rounded-sm border border-line bg-surface px-3 text-xs text-ink"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {/* Formulario Principal de Consulta */}
        <div className="mt-3 space-y-3.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div>
              <Label htmlFor="sec-select" className="text-xs">
                Sección Objetivo
              </Label>
              <select
                id="sec-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as SectionId)}
                className="mt-1 h-9.5 w-full rounded-sm border border-line bg-surface px-3 text-xs text-ink"
              >
                {sectionOrder.map((id) => (
                  <option key={id} value={id}>
                    {sections[id]?.title || id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="model-select" className="text-xs">
                Motor / Modelo de Gemini
              </Label>
              <select
                id="model-select"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="mt-1 h-9.5 w-full rounded-sm border border-line bg-surface px-3 text-xs text-ink font-medium focus:border-accent focus:outline-none"
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sugerencias Rápidas */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-faint">
              Prompts Rápidos para la EAAB:
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setPrompt(qp.text);
                    void handleGenerate(qp.text);
                  }}
                  className="rounded-full border border-line bg-bg-sunken px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-accent hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="gemini-prompt" className="text-xs">
              Instrucción o Pregunta
            </Label>
            <Textarea
              id="gemini-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej. Redacta la justificación académica de por qué la EAAB es una EICE distrital y cómo impacta su régimen tarifario..."
              className="text-sm"
            />
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={busy || !prompt.trim()}
            onClick={() => void handleGenerate()}
          >
            {busy ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Gemini Pro está pensando y redactando…
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Consultar / Redactar con Gemini Pro
              </>
            )}
          </Button>

          {/* Caja de Respuesta Generada */}
          {response ? (
            <div className="mt-3 rounded-xl border border-line bg-bg-sunken/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  Respuesta de Gemini Pro
                </span>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" onClick={handleCopy} title="Copiar al portapapeles">
                    <Copy className="size-3.5" />
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-ink pr-1">
                {response}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-2.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCreateFinding}
                  title="Guardar como hallazgo en la bitácora"
                >
                  <BookmarkPlus className="size-3.5 mr-1" />
                  Crear Hallazgo
                </Button>
                <Button
                  size="sm"
                  onClick={handleInsertIntoSection}
                  title="Insertar directamente en el texto de la sección y del Word"
                >
                  <FilePlus2 className="size-3.5 mr-1" />
                  Insertar en Sección y Word
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
