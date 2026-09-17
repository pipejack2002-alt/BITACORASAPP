import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Download,
  Edit3,
  ExternalLink,
  GraduationCap,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  ArrowRight,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useBitacora } from "@/lib/store";
import { DownloadWordButton } from "@/components/download-word";
import type { Company, Meta, TeamMember } from "@/lib/types";

export function ColumnaCeroView() {
  const navigate = useNavigate();
  const company = useBitacora((s) => s.company);
  const meta = useBitacora((s) => s.meta);
  const team = useBitacora((s) => s.team);
  const geminiApiKey = useBitacora((s) => s.geminiApiKey || "");
  const geminiModel = useBitacora((s) => s.geminiModel || "gemini-3.6-flash");

  const updateCompany = useBitacora((s) => s.updateCompany);
  const updateMeta = useBitacora((s) => s.updateMeta);
  const updateTeam = useBitacora((s) => s.updateTeam);

  // Estados locales editables
  const [activeTab, setActiveTab] = useState<"ficha" | "portada" | "ambas">("ambas");
  const [loadingAi, setLoadingAi] = useState(false);

  const [companyForm, setCompanyForm] = useState<Company>({
    shortName: "",
    legalName: "",
    nit: "",
    sector: "",
    founded: "",
    headquarters: "",
    website: "",
    nature: "",
    majorityShareholder: "",
  });

  const [metaForm, setMetaForm] = useState<Meta>({
    course: "",
    institution: "",
    professor: "",
    groupName: "",
    city: "",
    program: "Contaduría Publica",
    country: "Colombia",
    year: "2026",
    title: "",
  });

  const [students, setStudents] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (company) {
      setCompanyForm(company);
    }
  }, [company]);

  useEffect(() => {
    if (meta) {
      setMetaForm({
        course: meta.course || "ZCPVIIA AUDITORIA DE SISTEMA",
        institution: meta.institution || "CORPORACION UNIVERSITARIA LATINOAMERICANA (CUL)",
        professor: meta.professor || "WILMER RUIZ BOTERO",
        groupName: meta.groupName || "8° SEMESTRE · CONTADURÍA PÚBLICA",
        city: meta.city || "BARRANQUILLA",
        program: meta.program || "Contaduría Publica",
        country: meta.country || "Colombia",
        year: meta.year || "2026",
        title: meta.title || `Bitácora ${company.legalName || company.shortName || "EAAB-ESP"}`,
      });
    }
  }, [meta, company]);

  useEffect(() => {
    if (team) {
      const active = team.filter((t) => t.name.trim().length > 0);
      if (active.length > 0) {
        setStudents(team);
      } else {
        setStudents([
          { id: "s1", name: "ANDRES FELIPE BERNAL OSORIO", role: "Auditor Líder" },
          { id: "s2", name: "VIZCAINO ESCAMILLA MARIA", role: "Auditora" },
          { id: "s3", name: "MERCADO EGUIS SHADIA", role: "Auditora" },
        ]);
      }
    }
  }, [team]);

  function handleCompanyChange(k: keyof Company, val: string) {
    const updated = { ...companyForm, [k]: val };
    setCompanyForm(updated);
    updateCompany(updated);
  }

  function handleMetaChange(k: keyof Meta, val: string) {
    const updated = { ...metaForm, [k]: val };
    setMetaForm(updated);
    updateMeta(updated);
  }

  function handleStudentChange(id: string, name: string) {
    const next = students.map((s) => (s.id === id ? { ...s, name } : s));
    setStudents(next);
    updateTeam(id, { name });
  }

  function addStudent() {
    const newId = `s_${Date.now()}`;
    const next = [...students, { id: newId, name: "", role: "Auditor" }];
    setStudents(next);
    useBitacora.setState((state) => ({
      team: [...state.team, { id: newId, name: "", role: "Auditor" }],
      dirty: true,
    }));
  }

  function removeStudent(id: string) {
    const next = students.filter((s) => s.id !== id);
    setStudents(next);
    useBitacora.setState((state) => ({
      team: state.team.filter((t) => t.id !== id),
      dirty: true,
    }));
  }

  function handleSaveAll() {
    updateCompany(companyForm);
    updateMeta(metaForm);
    toast.success("¡Datos guardados con éxito!", {
      description: "La Portada, la Ficha Institucional y la exportación Word están sincronizados.",
    });
  }

  async function handleAutoFillCompanyAi() {
    const query = companyForm.shortName.trim() || companyForm.legalName.trim();
    if (!query) {
      toast.error("Escribe al menos el nombre o sigla de la entidad para investigar.");
      return;
    }

    setLoadingAi(true);
    try {
      const prompt = `Investiga la empresa o entidad colombiana: "${query}".
Devuelve ÚNICAMENTE un objeto JSON válido con los campos:
{
  "shortName": "Sigla o nombre corto",
  "legalName": "Razón social legal completa",
  "nit": "NIT con dígito de verificación",
  "sector": "Sector económico exacto",
  "founded": "Año de fundación",
  "headquarters": "Dirección y ciudad principal",
  "website": "URL oficial",
  "nature": "Naturaleza jurídica oficial",
  "majorityShareholder": "Composición accionaria / propietario"
}`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model: geminiModel,
          apiKey: geminiApiKey,
        }),
      });

      if (!res.ok) throw new Error("Error en el servicio de IA");
      const data = await res.json();
      const rawText = data.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const nextCompany = {
          ...companyForm,
          shortName: parsed.shortName || companyForm.shortName,
          legalName: parsed.legalName || companyForm.legalName,
          nit: parsed.nit || companyForm.nit,
          sector: parsed.sector || companyForm.sector,
          founded: parsed.founded || companyForm.founded,
          headquarters: parsed.headquarters || companyForm.headquarters,
          website: parsed.website || companyForm.website,
          nature: parsed.nature || companyForm.nature,
          majorityShareholder: parsed.majorityShareholder || companyForm.majorityShareholder,
        };
        setCompanyForm(nextCompany);
        updateCompany(nextCompany);
        toast.success("¡Datos de la empresa completados con Gemini Pro!");
      }
    } catch (err) {
      toast.error("No se pudo completar con IA. Puedes editar los campos manualmente.");
    } finally {
      setLoadingAi(false);
    }
  }

  const activeNamedStudents = students.filter((s) => s.name.trim().length > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-fg">
              0
            </span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
              Columna 0 de Auditoría · Datos Iniciales
            </p>
            <Badge tone="ok">
              <ShieldCheck className="mr-1 size-3" />
              Oficial
            </Badge>
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Ficha Institucional y Hoja de Presentación (Portada)
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Edita aquí los datos de la portada académica (Docente, Asignatura, Integrantes) y la Ficha de Identificación de la entidad auditada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" size="sm" onClick={handleSaveAll} className="gap-1.5">
            <Save className="size-4" />
            Guardar Cambios
          </Button>
          <DownloadWordButton size="sm" variant="secondary" />
          <Button variant="secondary" size="sm" asChild>
            <Link to="/seccion/$id" params={{ id: "empresa" }}>
              Ir a 1. Empresa
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Selector de Pestañas de Edición */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("ambas")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "ambas"
              ? "bg-accent text-accent-fg shadow-xs"
              : "text-ink-soft hover:bg-surface-2 hover:text-ink"
          }`}
        >
          <Edit3 className="size-3.5" />
          Ver Todo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ficha")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "ficha"
              ? "bg-accent text-accent-fg shadow-xs"
              : "text-ink-soft hover:bg-surface-2 hover:text-ink"
          }`}
        >
          <Building2 className="size-3.5" />
          1. Ficha de Identificación Institucional
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("portada")}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "portada"
              ? "bg-accent text-accent-fg shadow-xs"
              : "text-ink-soft hover:bg-surface-2 hover:text-ink"
          }`}
        >
          <GraduationCap className="size-3.5" />
          2. Portada Académica CUL
        </button>
      </div>

      {/* Grid de Edición y Previsualización */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* COLUMNA IZQUIERDA: FORMULARIOS DE EDICIÓN */}
        <div className="space-y-6">
          {/* Formulario 1: Ficha de Identificación Institucional */}
          {(activeTab === "ambas" || activeTab === "ficha") && (
            <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-accent" />
                  <h2 className="font-display text-base font-bold text-ink">
                    Ficha de Identificación Institucional
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs gap-1"
                  disabled={loadingAi}
                  onClick={handleAutoFillCompanyAi}
                >
                  {loadingAi ? (
                    <RefreshCw className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3 text-amber-500" />
                  )}
                  Investigar con IA
                </Button>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <Label className="text-xs font-semibold text-ink">
                    Entidad Auditada (Razón Social Completa)
                  </Label>
                  <Input
                    className="mt-1 text-xs"
                    value={companyForm.legalName}
                    onChange={(e) => handleCompanyChange("legalName", e.target.value)}
                    placeholder="Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-ink">Sigla / Nombre Corto</Label>
                    <Input
                      className="mt-1 text-xs"
                      value={companyForm.shortName}
                      onChange={(e) => handleCompanyChange("shortName", e.target.value)}
                      placeholder="EAAB"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-ink">NIT / Identificación</Label>
                    <Input
                      className="mt-1 text-xs font-mono"
                      value={companyForm.nit}
                      onChange={(e) => handleCompanyChange("nit", e.target.value)}
                      placeholder="899.999.094-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-ink">Domicilio Principal</Label>
                  <Input
                    className="mt-1 text-xs"
                    value={companyForm.headquarters}
                    onChange={(e) => handleCompanyChange("headquarters", e.target.value)}
                    placeholder="Avenida Calle 24 No. 37-15, Bogotá D.C., Colombia"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-ink">Naturaleza Jurídica</Label>
                  <Textarea
                    className="mt-1 text-xs min-h-[60px]"
                    value={companyForm.nature}
                    onChange={(e) => handleCompanyChange("nature", e.target.value)}
                    placeholder="Empresa industrial y comercial del Estado del orden distrital..."
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-ink">Sector Económico</Label>
                  <Input
                    className="mt-1 text-xs"
                    value={companyForm.sector}
                    onChange={(e) => handleCompanyChange("sector", e.target.value)}
                    placeholder="Servicios públicos domiciliarios: acueducto y alcantarillado"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-ink">Portal Web Oficial</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      className="text-xs font-mono"
                      value={companyForm.website}
                      onChange={(e) => handleCompanyChange("website", e.target.value)}
                      placeholder="https://www.acueducto.com.co"
                    />
                    {companyForm.website && (
                      <Button variant="secondary" size="sm" asChild className="shrink-0 px-2.5">
                        <a href={companyForm.website} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario 2: Hoja de Presentación Oficial (Portada APA 7 - CUL) */}
          {(activeTab === "ambas" || activeTab === "portada") && (
            <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-line/60 pb-3">
                <GraduationCap className="size-4 text-accent" />
                <h2 className="font-display text-base font-bold text-ink">
                  Hoja de Presentación (Portada CUL)
                </h2>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <Label className="text-xs font-semibold text-ink">Título de la Bitácora</Label>
                  <Input
                    className="mt-1 text-xs font-medium"
                    value={metaForm.title || `Bitácora ${companyForm.legalName || companyForm.shortName}`}
                    onChange={(e) => handleMetaChange("title", e.target.value)}
                    placeholder="Bitácora Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)"
                  />
                </div>

                <div className="space-y-2 rounded-lg border border-line/80 bg-surface-2 p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-ink">Estudiantes / Integrantes</Label>
                    <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 px-2 text-accent" onClick={addStudent}>
                      <Plus className="size-3" />
                      Agregar integrante
                    </Button>
                  </div>
                  {students.map((st, i) => (
                    <div key={st.id || i} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted w-4">{i + 1}.</span>
                      <Input
                        className="text-xs font-semibold uppercase h-8"
                        value={st.name}
                        onChange={(e) => handleStudentChange(st.id, e.target.value)}
                        placeholder="NOMBRE COMPLETO DEL ESTUDIANTE"
                      />
                      {students.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStudent(st.id)}
                          className="rounded p-1 text-faint hover:text-danger"
                          title="Eliminar integrante"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-ink">DOCENTE</Label>
                    <Input
                      className="mt-1 text-xs font-semibold uppercase"
                      value={metaForm.professor}
                      onChange={(e) => handleMetaChange("professor", e.target.value)}
                      placeholder="WILMER RUIZ BOTERO"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-ink">ASIGNATURA</Label>
                    <Input
                      className="mt-1 text-xs font-semibold uppercase"
                      value={metaForm.course}
                      onChange={(e) => handleMetaChange("course", e.target.value)}
                      placeholder="ZCPVIIA AUDITORIA DE SISTEMA"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-ink">Institución Universitaria</Label>
                  <Input
                    className="mt-1 text-xs font-medium"
                    value={metaForm.institution}
                    onChange={(e) => handleMetaChange("institution", e.target.value)}
                    placeholder="CORPORACION UNIVERSITARIA LATINOAMERICANA (CUL)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-ink">Programa / Carrera</Label>
                    <Input
                      className="mt-1 text-xs"
                      value={metaForm.program}
                      onChange={(e) => handleMetaChange("program", e.target.value)}
                      placeholder="Contaduría Publica"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-ink">Ciudad</Label>
                    <Input
                      className="mt-1 text-xs uppercase"
                      value={metaForm.city}
                      onChange={(e) => handleMetaChange("city", e.target.value)}
                      placeholder="BARRANQUILLA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-ink">País</Label>
                    <Input
                      className="mt-1 text-xs"
                      value={metaForm.country}
                      onChange={(e) => handleMetaChange("country", e.target.value)}
                      placeholder="Colombia"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-ink">Año</Label>
                    <Input
                      className="mt-1 text-xs font-mono"
                      value={metaForm.year}
                      onChange={(e) => handleMetaChange("year", e.target.value)}
                      placeholder="2026"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO (IDÉNTICA A LAS CAPTURAS) */}
        <div className="space-y-6 lg:sticky lg:top-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-accent" />
              <h2 className="font-display text-base font-bold text-ink">
                Vista Previa en Vivo (Word APA 7)
              </h2>
            </div>
            <span className="text-[11px] font-medium text-muted">
              Actualización instantánea
            </span>
          </div>

          {/* Tarjeta de Previsualización de Portada CUL (Captura 1) */}
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-md text-center text-slate-800">
            <div className="border-b border-line bg-slate-50/80 px-4 py-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Página 1: Hoja de Presentación Oficial CUL
              </p>
            </div>
            <div className="px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex justify-center">
                <img
                  src="/university-logo.png"
                  alt="Logo CUL"
                  className="h-20 w-auto object-contain"
                />
              </div>

              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {metaForm.title || `Bitácora ${companyForm.legalName || companyForm.shortName}`}
              </h3>

              <div className="my-5 space-y-1">
                {activeNamedStudents.map((s) => (
                  <p key={s.id} className="text-xs sm:text-sm font-bold tracking-wide text-slate-800 uppercase">
                    {s.name}
                  </p>
                ))}
              </div>

              <div className="my-4">
                <p className="text-[10px] font-bold text-slate-500 tracking-wider">DOCENTE</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                  {metaForm.professor || "WILMER RUIZ BOTERO"}
                </p>
              </div>

              <div className="my-4">
                <p className="text-[10px] font-bold text-slate-500 tracking-wider">ASIGNATURA</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase">
                  {metaForm.course || "ZCPVIIA AUDITORIA DE SISTEMA"}
                </p>
              </div>

              <div className="mt-6 space-y-0.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">
                  {metaForm.institution || "CORPORACION UNIVERSITARIA LATINOAMERICANA (CUL)"}
                </p>
                <p>{metaForm.program || "Contaduría Publica"}</p>
                <p className="uppercase">{metaForm.city || "BARRANQUILLA"}</p>
                <p>{metaForm.country || "Colombia"}</p>
                <p className="font-bold text-slate-900">{metaForm.year || "2026"}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Previsualización de Ficha de Identificación Institucional (Captura 2) */}
          <div className="overflow-hidden rounded-xl border border-line bg-white shadow-md text-slate-800">
            <div className="border-b border-line bg-slate-50/80 px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Página 2: Ficha Institucional
              </p>
            </div>
            <div className="p-5">
              <div className="text-center mb-4">
                <h4 className="font-display text-base font-bold text-blue-900 leading-snug">
                  {companyForm.legalName || companyForm.shortName}
                </h4>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                  1. FICHA DE IDENTIFICACIÓN INSTITUCIONAL
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-line bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-line">
                    <tr>
                      <td className="bg-slate-100 px-3 py-2 font-bold text-blue-950 w-2/5">
                        Entidad Auditada
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {companyForm.legalName || companyForm.shortName}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 px-3 py-2 font-bold text-blue-950">
                        NIT / Identificación
                      </td>
                      <td className="px-3 py-2 text-slate-800 font-mono">
                        {companyForm.nit}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 px-3 py-2 font-bold text-blue-950">
                        Domicilio Principal
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {companyForm.headquarters}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 px-3 py-2 font-bold text-blue-950">
                        Naturaleza Jurídica
                      </td>
                      <td className="px-3 py-2 text-slate-800 leading-relaxed">
                        {companyForm.nature}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 px-3 py-2 font-bold text-blue-950">
                        Sector Económico
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {companyForm.sector}
                      </td>
                    </tr>
                    <tr>
                      <td className="bg-slate-100 px-3 py-2 font-bold text-blue-950">
                        Portal Web Oficial
                      </td>
                      <td className="px-3 py-2 text-blue-600 font-mono underline break-all">
                        {companyForm.website}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
