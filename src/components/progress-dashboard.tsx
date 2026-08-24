import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CheckCircle2, FileText, Globe2, BookOpen, ShieldCheck } from "lucide-react";
import { useBitacora, useProgress } from "@/lib/store";
import { SOURCE_TYPE_LABEL } from "@/lib/seed";

const STATUS_COLORS = {
  validado: "#1F4F47", // Verde EAAB
  en_progreso: "#C88A2E", // Ámbar
  pendiente: "#A8A29E", // Gris neutro
};

export function ProgressDashboard() {
  const progress = useProgress();
  const sources = useBitacora((s) => s.sources);
  const attachments = useBitacora((s) => s.attachments);
  const findings = useBitacora((s) => s.findings);

  // Datos para el gráfico de estado de secciones
  const statusData = useMemo(() => {
    return [
      { name: "Validadas", value: progress.validated, color: STATUS_COLORS.validado },
      { name: "En progreso", value: progress.inProgress, color: STATUS_COLORS.en_progreso },
      { name: "Pendientes", value: progress.pending, color: STATUS_COLORS.pendiente },
    ].filter((d) => d.value > 0);
  }, [progress]);

  // Datos para la distribución de fuentes
  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of sources) {
      const label = SOURCE_TYPE_LABEL[s.type] || "Otra";
      counts[label] = (counts[label] || 0) + 1;
    }
    return Object.entries(counts).map(([name, cantidad]) => ({
      name,
      cantidad,
    }));
  }, [sources]);

  // Conteo de evidencias por tipo
  const evidenceCounts = useMemo(() => {
    const pdf = attachments.filter((a) => a.kind === "pdf").length;
    const word = attachments.filter((a) => a.kind === "word").length;
    const texto = attachments.filter((a) => a.kind === "texto").length;
    const otros = attachments.filter((a) => a.kind === "otro").length;
    return { pdf, word, texto, otros, total: attachments.length };
  }, [attachments]);

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-600 animate-pulse" />
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">
              Tablero de Control de Auditoría
            </p>
          </div>
          <h2 className="mt-1 font-display text-2xl text-ink">Estado y Métricas de Investigación</h2>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-bg-sunken px-3.5 py-1.5">
          <ShieldCheck className="size-5 text-accent" />
          <div>
            <p className="text-[11px] text-faint uppercase font-medium">Avance Global</p>
            <p className="font-display text-lg font-bold text-accent">{progress.pct}% Completado</p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-bg-sunken/50 p-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[12px] font-medium">Secciones</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="mt-1 font-display text-2xl text-ink">
            {progress.validated} <span className="text-sm text-faint font-normal">/ {progress.total}</span>
          </p>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-bg-sunken/50 p-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[12px] font-medium">Fuentes Oficiales</span>
            <Globe2 className="size-4 text-accent" />
          </div>
          <p className="mt-1 font-display text-2xl text-ink">{sources.length}</p>
          <p className="mt-0.5 text-[11px] text-faint">100% Verificadas</p>
        </div>

        <div className="rounded-lg border border-line bg-bg-sunken/50 p-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[12px] font-medium">Hallazgos</span>
            <BookOpen className="size-4 text-amber-600" />
          </div>
          <p className="mt-1 font-display text-2xl text-ink">{findings.length}</p>
          <p className="mt-0.5 text-[11px] text-faint">En diario cronológico</p>
        </div>

        <div className="rounded-lg border border-line bg-bg-sunken/50 p-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-[12px] font-medium">Evidencias / Anexos</span>
            <FileText className="size-4 text-ink-soft" />
          </div>
          <p className="mt-1 font-display text-2xl text-ink">{attachments.length}</p>
          <p className="mt-0.5 text-[11px] text-faint">
            {evidenceCounts.pdf} PDF · {evidenceCounts.word} Word · {evidenceCounts.texto} Texto
          </p>
        </div>
      </div>

      {/* Gráficos Estadísticos */}
      <div className="grid gap-4 pt-2 md:grid-cols-2">
        {/* Gráfico 1: Estado de Secciones (Donut Chart) */}
        <div className="rounded-lg border border-line p-4">
          <h3 className="text-sm font-semibold text-ink">Completitud por Secciones</h3>
          <p className="text-[12px] text-faint">Distribución del avance temático</p>
          <div className="mt-2 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} secciones`, name]}
                  contentStyle={{
                    backgroundColor: "#FAF6EE",
                    borderColor: "#E0D6C6",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#1C1915",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[12px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#1F4F47]" />
              Validadas ({progress.validated})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#C88A2E]" />
              En progreso ({progress.inProgress})
            </span>
            {progress.pending > 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#A8A29E]" />
                Pendientes ({progress.pending})
              </span>
            ) : null}
          </div>
        </div>

        {/* Gráfico 2: Fuentes Consultadas por Tipo (Bar Chart) */}
        <div className="rounded-lg border border-line p-4">
          <h3 className="text-sm font-semibold text-ink">Distribución de Fuentes</h3>
          <p className="text-[12px] text-faint">Tipología de referencias citadas (Norma APA 7)</p>
          <div className="mt-2 h-44 w-full">
            {sourceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceDistribution} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <XAxis type="number" allowDecimals={false} stroke="#6F675C" fontSize={11} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    stroke="#6F675C"
                    fontSize={11}
                    tickFormatter={(val: string) => (val.length > 15 ? `${val.slice(0, 14)}…` : val)}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} referencias`, "Total"]}
                    contentStyle={{
                      backgroundColor: "#FAF6EE",
                      borderColor: "#E0D6C6",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#1C1915",
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#1F4F47" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                No hay fuentes registradas aún.
              </div>
            )}
          </div>
          <p className="text-center text-[11px] text-faint mt-1">
            Cada fuente genera automáticamente su cita bibliográfica en el Word.
          </p>
        </div>
      </div>
    </div>
  );
}
