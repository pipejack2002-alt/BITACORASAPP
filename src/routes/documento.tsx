import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { STATUS_LABEL } from "@/lib/seed";
import { useBitacora } from "@/lib/store";
import { DownloadWordButton } from "@/components/download-word";

export const Route = createFileRoute("/documento")({ component: DocumentoPage });

function DocumentoPage() {
  const state = useBitacora();
  const named = state.team.filter((m) => m.name.trim());
  const activeStudents =
    named.length > 0
      ? named
      : [
          { id: "s1", name: "BERNAL OSORIO ANDRES", role: "Auditor Líder" },
          { id: "s2", name: "VIZCAINO ESCAMILLA MARIA", role: "Auditora" },
          { id: "s3", name: "MERCADO EGUIS SHADIA", role: "Auditora" },
        ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Documento Word (.docx)</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
            Vista previa exacta del reporte académico oficial bajo Norma APA 7ª Edición con logotipo de la Corporación Universitaria Latinoamericana (CUL).
          </p>
        </div>
        <DownloadWordButton size="default" />
      </div>

      {/* Vista previa de Hoja de Presentación Oficial */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line bg-white px-6 py-10 text-center text-slate-800">
          <div className="mx-auto mb-5 flex justify-center">
            <img
              src="/university-logo.png"
              alt="Logo Corporación Universitaria Latinoamericana"
              className="h-28 w-auto object-contain drop-shadow-xs"
            />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
            Bitácora {state.company.legalName || state.company.shortName}
          </h2>
          <div className="my-6 space-y-1">
            {activeStudents.map((s) => (
              <p key={s.id} className="text-sm font-bold tracking-wide text-slate-800 uppercase">
                {s.name}
              </p>
            ))}
          </div>

          <div className="my-5">
            <p className="text-xs font-bold text-slate-700">DOCENTE</p>
            <p className="text-sm font-bold text-slate-900 uppercase">
              {state.meta.professor || "RUIZ BOTERO WILMER"}
            </p>
          </div>

          <div className="my-5">
            <p className="text-xs font-bold text-slate-700">ASIGNATURA</p>
            <p className="text-sm font-bold text-slate-900 uppercase">
              {state.meta.course || "ZCPVIIIA AUDITORIA DE SISTEMA"}
            </p>
          </div>

          <div className="mt-8 space-y-0.5 text-xs font-medium text-slate-700">
            <p className="font-bold text-slate-900">
              {state.meta.institution || "Corporación Universitaria Latinoamericana"}
            </p>
            <p>Contaduría Publica</p>
            <p>{state.meta.city || "Barranquilla/Atlántico"}</p>
            <p>Colombia</p>
            <p className="font-bold text-slate-900">{new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Cuerpo del Documento (Página 2 en adelante) */}
        <div className="space-y-8 bg-slate-50/50 px-5 py-8 sm:px-10">
          <div className="text-center">
            <h3 className="font-display text-xl font-bold text-blue-900">
              {state.company.legalName || state.company.shortName}
            </h3>
            <p className="text-xs font-semibold uppercase text-slate-500 mt-1">
              1. Ficha de Identificación Institucional
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="bg-slate-100 px-3.5 py-2 font-bold text-blue-950 w-1/3">Entidad Auditada</td>
                  <td className="px-3.5 py-2 text-slate-800">{state.company.legalName || state.company.shortName}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 px-3.5 py-2 font-bold text-blue-950">NIT / Identificación</td>
                  <td className="px-3.5 py-2 text-slate-800">{state.company.nit}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 px-3.5 py-2 font-bold text-blue-950">Domicilio Principal</td>
                  <td className="px-3.5 py-2 text-slate-800">{state.company.headquarters}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 px-3.5 py-2 font-bold text-blue-950">Naturaleza Jurídica</td>
                  <td className="px-3.5 py-2 text-slate-800">{state.company.nature}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 px-3.5 py-2 font-bold text-blue-950">Sector Económico</td>
                  <td className="px-3.5 py-2 text-slate-800">{state.company.sector}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 px-3.5 py-2 font-bold text-blue-950">Portal Web Oficial</td>
                  <td className="px-3.5 py-2 text-blue-600 font-mono underline">{state.company.website}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {(state.sectionOrder ?? []).map((id, i) => {
            const s = state.sections[id];
            if (!s) return null;
            return (
              <DocBlock key={id} title={`${i + 2}. ${s.title}`}>
                <p className="italic text-muted text-xs">
                  Estado: {STATUS_LABEL[s.status]}
                </p>
                <div className="space-y-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-700">
                  {s.body.split("\n\n").slice(0, 3).join("\n\n")}
                </div>
                {s.body.split("\n\n").length > 3 ? (
                  <p className="text-[11px] text-faint italic">
                    …el archivo Word incluye el desarrollo completo de la sección y sus citas APA 7.
                  </p>
                ) : null}
              </DocBlock>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DocBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-lg border border-line bg-white p-4 shadow-2xs">
      <h4 className="font-display text-base font-bold text-blue-900">{title}</h4>
      <div className="space-y-2 text-slate-700">{children}</div>
    </section>
  );
}
