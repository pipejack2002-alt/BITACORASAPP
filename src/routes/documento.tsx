import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SOURCE_TYPE_LABEL, STATUS_LABEL } from "@/lib/seed";
import { useBitacora } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { DownloadWordButton } from "@/components/download-word";

export const Route = createFileRoute("/documento")({ component: DocumentoPage });

function DocumentoPage() {
  const state = useBitacora();
  const named = state.team.filter((m) => m.name.trim());

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Documento Word</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
            Vista previa de lo que se descarga. Cada hallazgo nuevo regenera el archivo
            completo: no editen el .docx a mano y luego pierdan el rastro.
          </p>
        </div>
        <DownloadWordButton size="default" />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line bg-accent px-6 py-8 text-center text-accent-fg">
          <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">
            {state.meta.institution}
          </p>
          <p className="mt-3 font-display text-3xl">Bitácora de investigación empresarial</p>
          <p className="mt-2 text-sm opacity-90">{state.company.legalName}</p>
        </div>
        <div className="space-y-8 px-5 py-8 sm:px-10">
          <DocBlock title="Identificación">
            <p>
              Equipo:{" "}
              {named.length
                ? named.map((m) => `${m.name} (${m.role})`).join("; ")
                : "Completen los nombres en Equipo. Los roles ya están asignados."}
            </p>
            <p>
              NIT {state.company.nit} · {state.findings.length} hallazgos ·{" "}
              {Object.values(state.sections).filter((s) => s.status === "validado").length}{" "}
              secciones validadas.
            </p>
          </DocBlock>

          {(state.sectionOrder ?? []).map((id, i) => {
            const s = state.sections[id];
            if (!s) return null;
            return (
              <DocBlock key={id} title={`${i + 1}. ${s.title}`}>
                <p className="italic text-muted">
                  {STATUS_LABEL[s.status]} · {s.summary}
                </p>
                {s.body.split("\n\n").slice(0, 2).map((b) => (
                  <p key={b.slice(0, 40)}>{b}</p>
                ))}
                {s.body.split("\n\n").length > 2 ? (
                  <p className="text-faint">…el Word incluye el texto completo de la sección.</p>
                ) : null}
              </DocBlock>
            );
          })}

          <DocBlock title="Anexos">
            {state.attachments.length === 0 ? (
              <p>Aún no hay PDF, Word ni textos pegados. Cárguenlos en Anexos.</p>
            ) : (
              state.attachments.map((a, i) => (
                <p key={a.id}>
                  {i + 1}. {a.title} · {state.sections[a.sectionId]?.shortTitle} ·{" "}
                  {a.fileName || "texto pegado"}
                </p>
              ))
            )}
          </DocBlock>

          <DocBlock title="Bitácora cronológica">
            {[...state.findings]
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
              .map((f, i) => (
                <p key={f.id}>
                  <span className="font-medium">
                    {i + 1}. {formatDate(f.date)} — {f.title}.
                  </span>{" "}
                  {f.content}
                </p>
              ))}
          </DocBlock>

          <DocBlock title="Fuentes">
            {state.sources.map((s, i) => (
              <p key={s.id}>
                {i + 1}. {s.name}. {SOURCE_TYPE_LABEL[s.type]}. {s.url}
              </p>
            ))}
          </DocBlock>
        </div>
      </div>
    </div>
  );
}

function DocBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl text-accent">{title}</h2>
      <div className="space-y-2 text-[14px] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}
