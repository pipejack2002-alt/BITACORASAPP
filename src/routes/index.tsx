import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Plus,
  ShieldCheck,
  FileText,
  BookOpen,
  Paperclip,
  Sparkles,
  Download,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceLinks } from "@/components/source-links";
import { STATUS_LABEL } from "@/lib/seed";
import { useBitacora, useProgress } from "@/lib/store";
import { AddSectionDialog } from "@/components/add-section-dialog";
import { InvestigatePanel } from "@/components/investigate-panel";
import { DownloadWordButton } from "@/components/download-word";
import { ProgressDashboard } from "@/components/progress-dashboard";
import { GeminiAssistantModal } from "@/components/gemini-assistant";
import { CompanySettingsDialog } from "@/components/company-settings-dialog";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const company = useBitacora((s) => s.company);
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const findings = useBitacora((s) => s.findings);
  const sources = useBitacora((s) => s.sources);
  const progress = useProgress();

  const checks = [
    { ok: true, label: "Misión (encabezado literal)", detail: "Ficha de Transparencia y página Visión y misión" },
    { ok: true, label: "Visión (encabezado literal)", detail: "Mismo texto en las dos URLs oficiales" },
    { ok: true, label: "Valores corporativos", detail: "Seis valores con definición, misma ficha" },
    { ok: true, label: "Organigrama PDF", detail: "18 de agosto de 2026, Gerente General Natasha Avendaño García" },
    { ok: true, label: "Normatividad legal", detail: "Ley 142, Ley 1712, CRA, SSPD, acuerdos de Junta" },
    { ok: true, label: "Normatividad ambiental", detail: "Gerencia Ambiental, PIGA, ISO 14001, Ley 99" },
    { ok: true, label: "Partes interesadas", detail: "Nueve grupos caracterizados por la EAAB" },
    { ok: true, label: "Funciones y procedimientos", detail: "Manual de cargos 2026 y mapas de proceso" },
    { ok: false, label: "Estados financieros", detail: "Suban el PDF del período o peguen la cifra" },
    { ok: false, label: "Políticas / SIG", detail: "Manual SUG o política: archivo o párrafo" },
  ];

  const workflowSteps = [
    {
      step: "1",
      icon: FolderOpen,
      title: "Explorar y Editar Secciones",
      desc: "Revisa la información institucional en el menú lateral (Misión, Visión, Organigrama, Finanzas). Puedes editar el texto, renombrar secciones o crear nuevas.",
      actionLabel: "Ver Secciones",
      href: "/seccion/empresa",
      isInternal: true,
    },
    {
      step: "2",
      icon: Paperclip,
      title: "Cargar Evidencias y PDFs",
      desc: "En la pestaña Anexos, sube documentos oficiales o pega balances. El sistema extrae el texto automáticamente para citarlo y respaldar tus hallazgos.",
      actionLabel: "Subir Anexos",
      href: "/anexos",
      isInternal: true,
    },
    {
      step: "3",
      icon: Sparkles,
      title: "Redactar y Analizar con Gemini Pro",
      desc: "Usa el copiloto de IA para redactar análisis académicos formales de cada sección, sintetizar cifras clave o extraer conclusiones en segundos.",
      actionLabel: "Asistente Gemini",
      isGemini: true,
    },
    {
      step: "4",
      icon: Download,
      title: "Descargar Reporte Word (.docx)",
      desc: "Genera el documento formal bajo Norma APA 7ª Edición con un solo clic. Incluye portada institucional, tabla de contenido, citas y anexos.",
      actionLabel: "Descargar Word",
      isDownload: true,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Banner Principal Ejecutivo */}
      <section className="rounded-xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">
            Plataforma de Investigación y Auditoría Institucional
          </p>
          <Badge tone="ok">
            <ShieldCheck className="mr-1 size-3.5" />
            Norma APA 7ª Edición
          </Badge>
        </div>

        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          Bitácora de Investigación: EAAB-ESP
        </h1>

        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-soft">
          Sistema centralizado para documentar, estructurar y auditar la información estratégica,
          financiera y normativa de la <strong>Empresa de Acueducto y Alcantarillado de Bogotá</strong>.
          Toda la evidencia, redacción y hallazgos registrados se sincronizan automáticamente en un reporte formal descargable en formato Word (.docx).
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <DownloadWordButton size="default" />
          <Button variant="secondary" asChild size="default">
            <Link to="/anexos">
              <Plus className="size-4" />
              Cargar Evidencias / Anexos
            </Link>
          </Button>
          <Button variant="ghost" asChild size="default">
            <Link to="/documento">
              <FileText className="size-4" />
              Vista Previa del Word
            </Link>
          </Button>
        </div>
      </section>

      {/* Guía de Trabajo Paso a Paso */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-4 text-accent" />
          <h2 className="font-display text-xl text-ink">¿Cómo trabajar en tu Bitácora? — Guía Paso a Paso</h2>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 shadow-sm transition-all hover:border-accent/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {st.step}
                    </span>
                    <Icon className="size-4 text-accent/80" />
                  </div>
                  <h3 className="mt-2.5 font-display text-base text-ink font-semibold">{st.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{st.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60">
                  {st.isInternal && st.href ? (
                    <Button variant="secondary" size="sm" className="w-full text-xs" asChild>
                      <Link to={st.href as any}>
                        {st.actionLabel}
                        <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  ) : null}

                  {st.isGemini ? (
                    <GeminiAssistantModal
                      triggerVariant="secondary"
                      triggerSize="sm"
                      triggerClassName="w-full text-xs"
                      triggerLabel="Abrir Asistente Gemini"
                    />
                  ) : null}

                  {st.isDownload ? (
                    <DownloadWordButton size="sm" variant="secondary" className="w-full text-xs" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboard Gráfico de Progreso */}
      <ProgressDashboard />

      {/* Asistente de Investigación con 1-Click */}
      <InvestigatePanel />

      {/* Ficha Institucional y Validación */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase tracking-[0.14em] text-faint">Empresa auditada</p>
              <h2 className="mt-1 font-display text-2xl text-ink">{company.shortName}</h2>
              <p className="mt-1 text-sm text-ink-soft">{company.legalName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="ok">
                <ShieldCheck className="mr-1 size-3" />
                Validada
              </Badge>
              <CompanySettingsDialog
                triggerVariant="secondary"
                triggerSize="sm"
                triggerLabel="Cambiar / Editar Empresa"
              />
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Item k="NIT" v={company.nit} />
            <Item k="Fundación" v={company.founded} />
            <Item k="Sector" v={company.sector} />
            <Item k="Sede" v={company.headquarters} />
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{company.nature}</p>
          <p className="mt-2 text-sm text-ink-soft">{company.majorityShareholder}</p>
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm text-accent underline-offset-2 hover:underline"
          >
            {company.website}
          </a>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-display text-xl">Por qué EAAB-ESP</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            El portal de Transparencia titula una ficha “Misión, visión, funciones y
            deberes”. Visión no se sustituye por propósito. El organigrama es un PDF
            fechado (18 de agosto de 2026) y el manual de funciones está en resoluciones
            descargables.
          </p>
          <ul className="mt-4 space-y-2">
            {checks.map((c) => (
              <li key={c.label} className="flex gap-2 text-sm">
                {c.ok ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                ) : (
                  <span className="mt-0.5 size-4 shrink-0 rounded-full border border-line-strong" />
                )}
                <span>
                  <span className="font-medium text-ink">{c.label}.</span>{" "}
                  <span className="text-muted">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            EPM publica propósito en lugar de visión. Esta bitácora usa EAAB porque el
            profesor pide los encabezados literales.
          </p>
        </div>
      </section>

      {/* Fuentes Oficiales Validadas */}
      <SourceLinks sources={sources} title="Fuentes oficiales (clic para validar)" />

      {/* Secciones del Tablero */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-2xl">Secciones del tablero</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">
              {progress.validated} listas · {findings.length} hallazgos
            </p>
            <AddSectionDialog />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {sectionOrder.map((id) => {
            const s = sections[id];
            if (!s) return null;
            const count = findings.filter((f) => f.sectionId === id).length;
            return (
              <Link
                key={id}
                to="/seccion/$id"
                params={{ id }}
                className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg text-ink">{s.title}</h3>
                  <Badge
                    tone={s.status === "validado" ? "ok" : s.status === "en_progreso" ? "warn" : "neutral"}
                  >
                    {STATUS_LABEL[s.status]}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{s.summary}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-[13px] text-accent">
                  {count} hallazgo{count === 1 ? "" : "s"}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</dt>
      <dd className="text-ink-soft">{v}</dd>
    </div>
  );
}
