import type { UrlCheck } from "./types";

export function classifyOfficial(raw: string): { official: boolean; reason: string; host: string } {
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
  if (host === "acueducto.com.co" || host.endsWith(".acueducto.com.co")) {
    return { official: true, reason: "Dominio oficial de la EAAB", host };
  }
  if (host.endsWith(".gov.co") || host.endsWith(".gob.co") || host === "gov.co") {
    return { official: true, reason: "Dominio oficial del Estado (.gov.co)", host };
  }
  return {
    official: false,
    reason: "No es un dominio oficial de la empresa ni .gov.co",
    host,
  };
}

export function checkLabel(check: UrlCheck) {
  if (check.official && check.live) return { tone: "ok" as const, text: "Oficial y responde" };
  if (check.official && !check.live) return { tone: "warn" as const, text: "Oficial, no respondió" };
  if (!check.official && check.live) return { tone: "warn" as const, text: "Responde, no es oficial" };
  return { tone: "warn" as const, text: "No validada" };
}

export async function requestUrlCheck(url: string): Promise<UrlCheck> {
  const res = await fetch("/api/validate-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const local = classifyOfficial(url);
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
