import { useState, useEffect } from "react";
import {
  Building2,
  Sparkles,
  Save,
  Globe,
  FileCheck,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useBitacora } from "@/lib/store";
import type { Company } from "@/lib/types";

export function CompanySettingsDialog({
  triggerVariant = "secondary",
  triggerSize = "sm",
  triggerClassName,
  triggerLabel,
}: {
  triggerVariant?: "default" | "secondary" | "ghost" | "danger";
  triggerSize?: "default" | "sm" | "lg";
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const company = useBitacora((s) => s.company);
  const updateCompany = useBitacora((s) => s.updateCompany);
  const geminiApiKey = useBitacora((s) => s.geminiApiKey || "");
  const geminiModel = useBitacora((s) => s.geminiModel || "gemini-3.6-flash");

  const [form, setForm] = useState<Company>({
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

  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (company) {
      setForm(company);
    }
  }, [company, open]);

  function handleChange(k: keyof Company, val: string) {
    setForm((prev) => ({ ...prev, [k]: val }));
  }

  function handleSave() {
    if (!form.shortName.trim()) {
      toast.error("El nombre o sigla no puede estar vacío.");
      return;
    }
    updateCompany(form);
    setOpen(false);
    toast.success("¡Datos de la empresa actualizados en la Bitácora y en el Word!");
  }

  async function handleAutoFillWithGemini() {
    const query = form.shortName.trim() || form.legalName.trim();
    if (!query) {
      toast.error("Escribe al menos el nombre o sigla de la empresa a consultar.");
      return;
    }

    setLoadingAi(true);
    try {
      const prompt = `Investiga la empresa o entidad colombiana/internacional: "${query}".
Devuelve ÚNICAMENTE un objeto JSON estrictamente válido (sin explicaciones ni markdown adicional) con los siguientes campos:
{
  "shortName": "Sigla o nombre corto",
  "legalName": "Razón social legal completa",
  "nit": "NIT con dígito de verificación (o identificación legal)",
  "sector": "Sector económico o industrial",
  "founded": "Año de fundación (ej. 1951)",
  "headquarters": "Ciudad y país de sede principal",
  "website": "URL oficial completa (https://...)",
  "nature": "Naturaleza jurídica (ej. Sociedad de economía mixta, EICE, Privada, etc.)",
  "majorityShareholder": "Composición accionaria o accionista mayoritario"
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

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo consultar con Gemini.");
        return;
      }

      // Extract JSON from response
      const rawText = data.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        toast.error("Gemini no devolvió el formato de datos estructurado.");
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]) as Partial<Company>;
      setForm((prev) => ({
        ...prev,
        ...parsed,
      }));

      toast.success(`¡Datos oficiales de ${parsed.shortName || query} cargados con Gemini!`);
    } catch (err) {
      console.error(err);
      toast.error("Error al autocompletar con Gemini.");
    } finally {
      setLoadingAi(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
          title="Configurar datos de la empresa auditada"
        >
          <Building2 className="size-4" />
          {triggerLabel || "Empresa Auditada"}
        </Button>
      </DialogTrigger>

      <DialogContent
        title="Configuración de la Empresa Auditada"
        className="w-[min(640px,calc(100vw-1.5rem))] max-h-[88vh] overflow-y-auto p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 -mt-2">
          <p className="text-xs text-faint">
            Modifica los datos para auditar la EAAB o cualquier otra entidad en el reporte Word.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={loadingAi}
            onClick={() => void handleAutoFillWithGemini()}
            className="text-xs text-accent hover:border-accent"
          >
            {loadingAi ? (
              <>
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
                Investigando...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 size-3.5 text-emerald-600 animate-pulse" />
                Auto-llenar con Gemini
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-short" className="text-xs">
                Sigla o Nombre Corto
              </Label>
              <Input
                id="c-short"
                value={form.shortName}
                onChange={(e) => handleChange("shortName", e.target.value)}
                placeholder="Ej. EAAB, EPM, Ecopetrol..."
                className="mt-1 font-semibold"
              />
            </div>

            <div>
              <Label htmlFor="c-nit" className="text-xs">
                NIT o Identificación
              </Label>
              <Input
                id="c-nit"
                value={form.nit}
                onChange={(e) => handleChange("nit", e.target.value)}
                placeholder="Ej. 899.999.094-1"
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="c-legal" className="text-xs">
              Razón Social Completa
            </Label>
            <Input
              id="c-legal"
              value={form.legalName}
              onChange={(e) => handleChange("legalName", e.target.value)}
              placeholder="Ej. Empresa de Acueducto y Alcantarillado de Bogotá E.S.P."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-sector" className="text-xs">
                Sector Económico
              </Label>
              <Input
                id="c-sector"
                value={form.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                placeholder="Ej. Servicios públicos domiciliarios"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="c-founded" className="text-xs">
                Año de Fundación
              </Label>
              <Input
                id="c-founded"
                value={form.founded}
                onChange={(e) => handleChange("founded", e.target.value)}
                placeholder="Ej. 1888"
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-hq" className="text-xs">
                Sede Principal
              </Label>
              <Input
                id="c-hq"
                value={form.headquarters}
                onChange={(e) => handleChange("headquarters", e.target.value)}
                placeholder="Ej. Bogotá D.C., Colombia"
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="c-web" className="text-xs">
                Sitio Web Oficial
              </Label>
              <Input
                id="c-web"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://..."
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="c-nature" className="text-xs">
              Naturaleza Jurídica y Régimen
            </Label>
            <Textarea
              id="c-nature"
              rows={2}
              value={form.nature}
              onChange={(e) => handleChange("nature", e.target.value)}
              placeholder="Ej. Empresa Industrial y Comercial del Estado (EICE)..."
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label htmlFor="c-shares" className="text-xs">
              Composición Accionaria / Control
            </Label>
            <Input
              id="c-shares"
              value={form.majorityShareholder}
              onChange={(e) => handleChange("majorityShareholder", e.target.value)}
              placeholder="Ej. 100% pública (Distrito Capital de Bogotá)"
              className="mt-1 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
          >
            <Save className="size-3.5 mr-1" />
            Guardar Datos de la Empresa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
