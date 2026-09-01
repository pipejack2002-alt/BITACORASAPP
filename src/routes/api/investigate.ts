import { createFileRoute } from "@tanstack/react-router";
import { classifyOfficial } from "@/lib/official-url";
import { AUDITOR_UA, probeUrl } from "@/lib/probe-url";
import type { InvestigateHit, InvestigateResponse } from "@/lib/investigate";
import { PDF_ORGANIGRAMA, sources as seedSources } from "@/lib/seed";

const EAAB_HUBS = [
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica", label: "Transparencia EAAB" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes", label: "Misión, visión, funciones y deberes" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision", label: "Visión y misión" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/estructura_org%C3%A1nica_organigrama", label: "Organigrama" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial", label: "Responsabilidad social" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial/grupos%20de%20interes", label: "Grupos de interés" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/planeacion_presupuesto_informes", label: "Planeación, presupuesto e informes financieros" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/contratacion", label: "Contratación y adquisiciones EAAB" },
  { url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mapas_cartas_descriptivas", label: "Mapas y cartas de procesos" },
];

const KNOWN_LAWS: { keys: string[]; title: string; url: string }[] = [
  {
    keys: ["1712", "transparencia", "acceso a la informacion", "publica"],
    title: "Ley 1712 de 2014 — transparencia y acceso a la información pública",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882",
  },
  {
    keys: ["142", "servicios públicos", "servicios publicos", "regimen"],
    title: "Ley 142 de 1994 — régimen de servicios públicos domiciliarios",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752",
  },
  {
    keys: ["43", "contador", "contaduria", "auditoria", "fe publica"],
    title: "Ley 43 de 1990 — Estatuto del Contador Público y ejercicio de la auditoría en Colombia",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=269",
  },
  {
    keys: ["99", "ambiental", "medio ambiente", "sina", "recursos"],
    title: "Ley 99 de 1993 — Sistema Nacional Ambiental (SINA)",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=297",
  },
  {
    keys: ["1076", "decreto ambiental", "sector ambiente", "vertimientos"],
    title: "Decreto 1076 de 2015 — Decreto Único Reglamentario del sector ambiente",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=78153",
  },
  {
    keys: ["1581", "habeas data", "datos personales", "privacidad"],
    title: "Ley 1581 de 2012 — régimen general de protección de datos personales",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981",
  },
  {
    keys: ["143", "electricidad", "eléctrica"],
    title: "Ley 143 de 1994 — régimen eléctrico",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4631",
  },
  {
    keys: ["222", "codigo de comercio", "sociedades", "estados financieros", "control interno"],
    title: "Ley 222 de 1995 — reforma al Código de Comercio y régimen societario y contable",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4895",
  },
];

const STOP = new Set(
  "el la los las de del un una y o en para por con a al que se su su the of and".split(" "),
);

const cache = new Map<string, { at: number; html: string }>();
const CACHE_MS = 30 * 60 * 1000;

function tokens(q: string) {
  return q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function normUrl(raw: string) {
  try {
    const u = new URL(raw);
    u.hash = "";
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return `${u.origin}${path}${u.search}`;
  } catch {
    return raw.split("#")[0];
  }
}

function looksLikeUrl(q: string) {
  return /^https?:\/\//i.test(q.trim());
}

function titleFrom(text: string, href: string) {
  const t = text.replace(/\s+/g, " ").trim();
  const file = decodeURIComponent(href.split("/").pop() || "")
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (t.length > 12 && !/^(conoce|ver|consultar|descubre|explorar)\b/i.test(t)) return t;
  if (file.length > 4) return file.charAt(0).toUpperCase() + file.slice(1);
  return t || href;
}

function score(query: string, title: string, href: string) {
  const q = tokens(query);
  if (q.length === 0) return 0;
  const hay = `${title} ${href}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let s = 0;
  for (const t of q) {
    if (hay.includes(t)) s += href.toLowerCase().includes(t) ? 4 : 6;
  }
  const phrase = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (phrase.length > 8 && hay.includes(phrase)) s += 14;
  if (s > 0 && href.toLowerCase().endsWith(".pdf")) s += 2;
  return s;
}

function extractLinks(html: string, pageUrl: string, companyWebsite?: string) {
  const out: { href: string; text: string }[] = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let href = m[1];
    const text = m[2].replace(/<[^>]+>/g, " ");
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) continue;
    try {
      href = new URL(href, pageUrl).href;
    } catch {
      continue;
    }
    if (!classifyOfficial(href, companyWebsite).official) continue;
    if (/politica-de-cookies|facebook|twitter|linkedin|youtube|instagram|norma_error|error\.php/i.test(href)) continue;
    out.push({ href: normUrl(href), text });
  }
  return out;
}

async function fetchHub(url: string) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.html;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": AUDITOR_UA, Accept: "text/html" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    const html = await res.text();
    cache.set(url, { at: Date.now(), html });
    return html;
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/api/investigate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => null)) as {
            query?: string;
            companyWebsite?: string;
            companyName?: string;
          } | null;

          const query = (body?.query || "").trim();
          const companyWebsite = (body?.companyWebsite || "").trim();
          const companyName = (body?.companyName || "").trim();

          if (query.length < 3) {
            return Response.json({ error: "Escriba qué buscar (mínimo 3 letras)." }, { status: 400 });
          }

          if (looksLikeUrl(query)) {
            const check = await probeUrl(query, companyWebsite);
            let pageTitle = query;
            if (check.live) {
              const html = await fetchHub(query);
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              if (titleMatch && titleMatch[1].trim()) {
                pageTitle = titleMatch[1].trim();
              }
            }
            const payload: InvestigateResponse = {
              query,
              note: check.official
                ? `URL validada con éxito como dominio oficial (${check.reason}).`
                : `URL alcanzable, pero no coincide con dominios oficiales registrados.`,
              hits: [
                {
                  title: pageTitle,
                  url: check.finalUrl || query,
                  hub: "URL Oficial Consultada",
                  check,
                },
              ],
            };
            return Response.json(payload);
          }

          type Cand = { title: string; url: string; hub: string; pts: number };
          const bag = new Map<string, Cand>();
          const add = (c: Cand) => {
            const key = c.url.toLowerCase();
            const prev = bag.get(key);
            if (!prev || c.pts > prev.pts) bag.set(key, c);
          };

          // 1. Fuentes conocidas del seed
          for (const s of seedSources) {
            const pts = score(query, `${s.name} ${s.notes}`, s.url);
            if (pts > 0) add({ title: s.name, url: normUrl(s.url), hub: "Fuentes de la Bitácora", pts: pts + 3 });
          }

          // 2. Marco legal colombiano
          for (const law of KNOWN_LAWS) {
            const pts = score(query, law.keys.join(" ") + " " + law.title, law.url);
            if (pts > 0) add({ title: law.title, url: law.url, hub: "Función Pública / Normatividad", pts: pts + 8 });
          }

          // 3. Hubs a consultar (sitio oficial de la empresa o EAAB por defecto)
          const hubsToScan: { url: string; label: string }[] = [];

          if (companyWebsite && companyWebsite.startsWith("http")) {
            const cleanBase = companyWebsite.replace(/\/$/, "");
            hubsToScan.push(
              { url: cleanBase, label: `${companyName || "Empresa"} - Inicio Oficial` },
              { url: `${cleanBase}/transparencia`, label: "Transparencia y Acceso a la Información" },
              { url: `${cleanBase}/quienes-somos`, label: "Quiénes Somos / Misión y Visión" },
              { url: `${cleanBase}/organigrama`, label: "Estructura Orgánica" },
              { url: `${cleanBase}/gobierno-corporativo`, label: "Gobierno Corporativo y Políticas" },
              { url: `${cleanBase}/sostenibilidad`, label: "Sostenibilidad y RSE" },
            );
          } else {
            hubsToScan.push(...EAAB_HUBS);
            add({
              title: "Organigrama EAAB-ESP (PDF, 18 de agosto de 2026)",
              url: PDF_ORGANIGRAMA,
              hub: "Organigrama",
              pts: score(query, "organigrama estructura gerencia general", PDF_ORGANIGRAMA),
            });
          }

          const pages = await Promise.allSettled(
            hubsToScan.map(async (hub) => {
              const html = await fetchHub(hub.url);
              return { hub, html };
            }),
          );

          for (const p of pages) {
            if (p.status !== "fulfilled") continue;
            const { hub, html } = p.value;
            const hubPts = score(query, hub.label, hub.url);
            if (hubPts > 0) {
              add({
                title: hub.label,
                url: normUrl(hub.url),
                hub: hub.label,
                pts: hubPts,
              });
            }
            for (const link of extractLinks(html, hub.url, companyWebsite)) {
              const title = titleFrom(link.text, link.href);
              const pts = score(query, title, link.href);
              if (pts <= 0) continue;
              add({ title, url: link.href, hub: hub.label, pts });
            }
          }

          const ranked = [...bag.values()].filter((c) => c.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, 8);
          const hits: InvestigateHit[] = [];
          for (const c of ranked) {
            const check = await probeUrl(c.url, companyWebsite);
            if (!check.official) continue;
            const final = check.finalUrl || c.url;
            if (/error\.php|norma_error/i.test(final)) continue;
            hits.push({ title: c.title, url: final, hub: c.hub, check });
          }

          const payload: InvestigateResponse = {
            query,
            hits,
            note: hits.length
              ? `Se localizaron ${hits.length} fuentes y enlaces oficiales verificados para ${companyName || "la auditoría"}.`
              : "No se encontraron enlaces oficiales directos. Puedes pegar la URL exacta (https://...) para validarla y añadirla en 1-clic.",
          };
          return Response.json(payload);
        } catch (err) {
          const message = err instanceof Error ? err.message : "error";
          return Response.json({ error: message, query: "" }, { status: 500 });
        }
      },
    },
  },
});
