import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBitacora } from "@/lib/store";

export const Route = createFileRoute("/equipo")({ component: EquipoPage });

function EquipoPage() {
  const meta = useBitacora((s) => s.meta);
  const team = useBitacora((s) => s.team);
  const updateMeta = useBitacora((s) => s.updateMeta);
  const updateTeam = useBitacora((s) => s.updateTeam);
  const resetContent = useBitacora((s) => s.resetContent);
  const importState = useBitacora((s) => s.importState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function exportBackup() {
    const fullState = useBitacora.getState();
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      meta: fullState.meta,
      team: fullState.team,
      company: fullState.company,
      sections: fullState.sections,
      sectionOrder: fullState.sectionOrder,
      findings: fullState.findings,
      sources: fullState.sources,
      attachments: fullState.attachments,
      orgChart: fullState.orgChart,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const d = new Date();
    const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    a.download = `Bitacora_EAAB_Respaldo_${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Copia de seguridad descargada en formato JSON");
  }

  function handleImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result || "{}"));
        if (!data.sections || !data.team) {
          toast.error("El archivo no es una copia de seguridad válida de la Bitácora.");
          return;
        }
        if (confirm("¿Cargar esta copia de seguridad? Reemplazará los datos actuales en este navegador.")) {
          importState(data);
          toast.success("Copia de seguridad restaurada con éxito", {
            description: `${Object.keys(data.sections).length} secciones y ${data.findings?.length || 0} hallazgos cargados.`,
          });
        }
      } catch {
        toast.error("Error al leer el archivo JSON de respaldo.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Equipo</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Opcional. Si ponen nombres, salen en el Word. Asignatura y docente no van
          en portada a menos que los llenen aquí.
        </p>
      </div>

      <section className="grid gap-3 rounded-xl border border-line bg-surface p-5">
        <Field label="Asignatura" value={meta.course} onChange={(v) => updateMeta({ course: v })} />
        <Field
          label="Institución"
          value={meta.institution}
          onChange={(v) => updateMeta({ institution: v })}
        />
        <Field
          label="Docente"
          value={meta.professor}
          onChange={(v) => updateMeta({ professor: v })}
        />
        <Field
          label="Nombre del grupo"
          value={meta.groupName}
          onChange={(v) => updateMeta({ groupName: v })}
        />
        <Field label="Ciudad" value={meta.city} onChange={(v) => updateMeta({ city: v })} />
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl">Cinco estudiantes</h2>
        <div className="mt-4 grid gap-4">
          {team.map((m, i) => (
            <div key={m.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`n-${m.id}`}>Estudiante {i + 1}</Label>
                <Input
                  id={`n-${m.id}`}
                  value={m.name}
                  placeholder="Nombre completo"
                  onChange={(e) => updateTeam(m.id, { name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`r-${m.id}`}>Rol en el trabajo</Label>
                <Input
                  id={`r-${m.id}`}
                  value={m.role}
                  onChange={(e) => updateTeam(m.id, { role: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-display text-xl">Copia de Seguridad y Transferencia</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Exporten un archivo JSON para guardar una copia de todo el avance o transferir la bitácora al computador de otro compañero del equipo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportBackup}>
            <Download className="size-4" />
            Exportar Respaldo (.json)
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImportFile(file);
                e.target.value = "";
              }
            }}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="size-4" />
            Importar Respaldo (.json)
          </Button>
        </div>
      </section>

      <div className="rounded-xl border border-line bg-surface-2 p-5">
        <h2 className="font-display text-lg">Cómo trabajar el Word vivo</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
          <li>Escriban sus nombres aquí. Quedan en la portada.</li>
          <li>Lean cada sección: el texto ya está validado con fuentes oficiales de la EAAB.</li>
          <li>
            Cuando encuentren un dato nuevo, ábranlo como hallazgo (fecha + URL). No lo
            peguen solo en el cuerpo.
          </li>
          <li>
            Descarguen el Word. Vuelve a generarse entero. Si mañana agregan tres
            hallazgos, el archivo de mañana los incluye.
          </li>
          <li>Entreguen la última descarga, no un borrador viejo.</li>
        </ol>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => {
            if (confirm("¿Restaurar el texto validado de la EAAB? Se conservan nombres del equipo.")) {
              resetContent();
            }
          }}
        >
          <RotateCcw className="size-4" />
          Restaurar contenido validado de la EAAB
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = label;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
