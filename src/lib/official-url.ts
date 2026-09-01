import type { UrlCheck } from "./types";

export function classifyOfficial(
  raw: string,
  companyWebsite?: string,
): { official: boolean; reason: string; host: string } {
  let host = "";
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { official: false, reason: "La URL debe empezar por https://", host: "" };
    }
    host = u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { official: false, reason: "URL mal escrita", host: "" };
  }

  // Dominio de la empresa configurada actualmente en la bitácora
  if (companyWebsite && companyWebsite.trim()) {
    try {
      const compU = new URL(
        companyWebsite.trim().startsWith("http") ? companyWebsite.trim() : `https://${companyWebsite.trim()}`,
      );
      const compHost = compU.hostname.toLowerCase().replace(/^www\./, "");
      if (host === compHost || host.endsWith(`.${compHost}`)) {
        return { official: true, reason: `Dominio oficial de la entidad auditada (${compHost})`, host };
      }
    } catch {
      /* ignore invalid company url */
    }
  }

  // Dominios de empresas reconocidas
  if (host === "acueducto.com.co" || host.endsWith(".acueducto.com.co")) {
    return { official: true, reason: "Dominio oficial de la EAAB", host };
  }
  if (host === "epm.com.co" || host.endsWith(".epm.com.co")) {
    return { official: true, reason: "Dominio oficial de EPM", host };
  }
  if (host === "ecopetrol.com.co" || host.endsWith(".ecopetrol.com.co")) {
    return { official: true, reason: "Dominio oficial de Ecopetrol", host };
  }
  if (host === "aaa.com.co" || host.endsWith(".aaa.com.co")) {
    return { official: true, reason: "Dominio oficial de Triple A Barranquilla", host };
  }

  // Dominios del Estado Colombiano y Regulación Pública
  if (
    host.endsWith(".gov.co") ||
    host.endsWith(".gob.co") ||
    host === "gov.co" ||
    host.endsWith(".co") && (host.includes("gobierno") || host.includes("alcaldia") || host.includes("gobernacion"))
  ) {
    return { official: true, reason: "Dominio oficial del Estado / Entidad Pública (.gov.co)", host };
  }

  // Entidades reguladoras, normativas y académicas de auditoría
  if (
    host === "funcionpublica.gov.co" ||
    host === "superservicios.gov.co" ||
    host === "cra.gov.co" ||
    host === "contaduria.gov.co" ||
    host === "dian.gov.co" ||
    host === "superfinanciera.gov.co" ||
    host === "supersociedades.gov.co" ||
    host === "mintic.gov.co" ||
    host === "minhacienda.gov.co" ||
    host === "minambiente.gov.co" ||
    host === "icontec.org" ||
    host === "iso.org" ||
    host.endsWith(".edu.co")
  ) {
    return { official: true, reason: "Portal oficial regulador, normativo o académico", host };
  }

  return {
    official: false,
    reason: "No coincide con el dominio oficial de la empresa ni portales reguladores del Estado",
    host,
  };
}

export function checkLabel(check: UrlCheck) {
  if (check.official && check.live) return { tone: "ok" as const, text: "Oficial y responde" };
  if (check.official && !check.live) return { tone: "warn" as const, text: "Oficial, no respondió" };
  if (!check.official && check.live) return { tone: "warn" as const, text: "Responde, no es oficial" };
  return { tone: "warn" as const, text: "No validada" };
}

export async function requestUrlCheck(url: string, companyWebsite?: string): Promise<UrlCheck> {
  const res = await fetch("/api/validate-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, companyWebsite }),
  });
  if (!res.ok) {
    const local = classifyOfficial(url, companyWebsite);
    return {
      official: local.official,
      live: false,
      httpStatus: null,
      finalUrl: url,
      checkedAt: new Date().toISOString(),
      reason: local.official ? "No se pudo consultar el sitio" : local.reason,
    };
  }
  return (await res.json()) as UrlCheck;
}
