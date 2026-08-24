import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FindingForm } from "@/components/finding-form";
import { InvestigatePanel } from "@/components/investigate-panel";
import { formatApa7Citation } from "@/lib/apa";
import { SOURCE_TYPE_LABEL } from "@/lib/seed";
import { useBitacora } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { SectionId } from "@/lib/types";

export const Route = createFileRoute("/bitacora")({ component: BitacoraPage });

function BitacoraPage() {
  const findings = useBitacora((s) => s.findings);
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const sources = useBitacora((s) => s.sources);
  const removeFinding = useBitacora((s) => s.removeFinding);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<SectionId | "todas">("todas");

  const list = useMemo(() => {
    const rows =
      filter === "todas" ? findings : findings.filter((f) => f.sectionId === filter);
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [findings, filter]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Bitácora</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
            Diario de investigación. Cada entrada pide fecha, dato y fuente. Para
            estados financieros o políticas:{" "}
            <Link to="/anexos" className="text-accent underline-offset-2 hover:underline">
              subir PDF / Word o pegar texto
            </Link>
            .
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Nuevo hallazgo
            </Button>
          </DialogTrigger>
          <DialogContent title="Registrar hallazgo">
            <FindingForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <InvestigatePanel />

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <FilterChip active={filter === "todas"} onClick={() => setFilter("todas")}>
          Todas ({findings.length})
        </FilterChip>
        {sectionOrder.map((id) => (
          <FilterChip key={id} active={filter === id} onClick={() => setFilter(id)}>
            {sections[id]?.shortTitle ?? id}
          </FilterChip>
        ))}
      </div>

      <ol className="relative space-y-0 border-l border-line pl-5">
        {list.map((f) => (
          <li key={f.id} className="relative pb-6">
            <span className="absolute -left-[23px] top-1 size-2.5 rounded-full border-2 border-bg bg-accent" />
            <div className="rounded-lg border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[12px] text-faint">
                  {formatDate(f.date)} · {f.author}
                </p>
                <Badge tone="accent">{sections[f.sectionId]?.shortTitle ?? f.sectionId}</Badge>
                <button
                  type="button"
                  className="ml-auto rounded-sm p-1.5 text-faint hover:bg-bg-sunken hover:text-danger"
                  onClick={() => removeFinding(f.id)}
                  aria-label="Eliminar hallazgo"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <h2 className="mt-1 font-display text-lg text-ink">{f.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.content}</p>
              <p className="mt-2 text-[12px] text-muted">
                {SOURCE_TYPE_LABEL[f.sourceType]}
                {f.sourceUrl ? (
                  <>
                    {" · "}
                    <a
                      href={f.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {f.sourceName}
                    </a>
                  </>
                ) : (
                  <> · {f.sourceName}</>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl">Bibliografía (Norma APA 7ª Ed.) · {sources.length}</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const allApa = sources.map((s) => formatApa7Citation(s)).join("\n\n");
              void navigator.clipboard.writeText(allApa);
              toast.success("Toda la bibliografía copiada en formato APA 7");
            }}
          >
            <Copy className="size-3.5" />
            Copiar toda la bibliografía
          </Button>
        </div>
        <ul className="mt-4 space-y-4">
          {sources.map((s, i) => {
            const apaCitation = formatApa7Citation(s);
            return (
              <li key={s.id} className="rounded-lg border border-line/60 bg-surface-2 p-3 text-sm leading-relaxed">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-ink-soft">
                    <span className="font-semibold text-accent">{i + 1}.</span> {apaCitation}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      void navigator.clipboard.writeText(apaCitation);
                      toast.success("Cita APA 7 copiada al portapapeles");
                    }}
                    title="Copiar cita APA 7"
                  >
                    <Copy className="size-3.5" />
                    Copiar APA
                  </Button>
                </div>
                {s.notes ? <p className="mt-1.5 text-xs text-muted">Nota: {s.notes}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "h-9 shrink-0 rounded-full bg-accent px-3 text-[12px] text-accent-fg"
          : "h-9 shrink-0 rounded-full border border-line bg-surface px-3 text-[12px] text-ink-soft"
      }
    >
      {children}
    </button>
  );
}
