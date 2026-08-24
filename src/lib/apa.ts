import type { Source } from "./types";
import { formatDate } from "./utils";

/**
 * Formatea una fuente de investigación bajo la norma APA 7ª edición.
 * Estructura general: Autor institucional o personal. (Año o s.f.). Título de la fuente o reporte. Portal / Entidad. URL
 */
export function formatApa7Citation(source: Source, companyName = "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P."): string {
  const url = (source.url || "").trim();
  const title = (source.name || "Documento sin título").trim();
  
  // Determinación del autor
  let author = companyName;
  if (url.includes("funcionpublica.gov.co")) {
    author = "Departamento Administrativo de la Función Pública";
  } else if (url.includes("minambiente.gov.co")) {
    author = "Ministerio de Ambiente y Desarrollo Sostenible";
  } else if (url.includes("cra.gov.co")) {
    author = "Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA)";
  } else if (url.includes("superservicios.gov.co")) {
    author = "Superintendencia de Servicios Públicos Domiciliarios (SSPD)";
  } else if (url.includes("alcaldiabogota.gov.co")) {
    author = "Alcaldía Mayor de Bogotá D.C.";
  }

  // Determinación del año
  let year = "s.f.";
  const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
  } else if (source.consultedAt) {
    const consultedYear = source.consultedAt.slice(0, 4);
    if (/^\d{4}$/.test(consultedYear)) {
      year = consultedYear;
    }
  }

  const consultedDate = source.consultedAt ? formatDate(source.consultedAt) : "recientemente";

  if (url) {
    return `${author}. (${year}). ${title}. Recuperado el ${consultedDate}, de ${url}`;
  }

  return `${author}. (${year}). ${title}. Archivo institucional.`;
}
