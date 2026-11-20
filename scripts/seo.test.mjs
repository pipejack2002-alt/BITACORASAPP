import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { injectGrokPwaHead, readOgSite } from "./grok-pwa-shared.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL_ORIGIN = "https://bitacora.tributoapp.me";

test("robots.txt points to canonical sitemap and does not block assets or noindex HTML routes", () => {
  const robots = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
  assert.match(robots, /^User-agent:\s*\*/m);
  assert.match(robots, /^Allow:\s*\//m);
  assert.match(robots, /^Disallow:\s*\/api\//m);
  assert.match(robots, /^Disallow:\s*\/exports\//m);
  assert.match(robots, /^Disallow:\s*\/__grok\//m);
  assert.match(robots, new RegExp(`^Sitemap:\\s*${CANONICAL_ORIGIN.replaceAll(".", "\\.")}/sitemap\\.xml\\s*$`, "m"));

  for (const unblocked of ["/assets/", "/anexos", "/bitacora", "/descargar", "/documento", "/equipo", "/seccion"]) {
    assert.doesNotMatch(robots, new RegExp(`^Disallow:\\s*${unblocked.replaceAll("/", "\\/")}`, "m"));
  }
});

test("sitemap.xml contains only the canonical home URL", () => {
  const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, [`${CANONICAL_ORIGIN}/`]);
  assert.doesNotMatch(sitemap, /vercel\.app/);
});

test("home route declares canonical and og:url under bitacora.tributoapp.me", () => {
  const home = readFileSync(join(ROOT, "src/routes/index.tsx"), "utf8");
  assert.match(home, /rel:\s*"canonical",\s*href:\s*"https:\/\/bitacora\.tributoapp\.me\/"/);
  assert.match(home, /property:\s*"og:url",\s*content:\s*"https:\/\/bitacora\.tributoapp\.me\/"/);
});

test("all work subroutes declare noindex, nofollow", () => {
  const subroutes = [
    "src/routes/anexos.tsx",
    "src/routes/bitacora.tsx",
    "src/routes/descargar.tsx",
    "src/routes/documento.tsx",
    "src/routes/equipo.tsx",
    "src/routes/seccion.$id.tsx",
  ];
  for (const rel of subroutes) {
    const src = readFileSync(join(ROOT, rel), "utf8");
    assert.match(src, /name:\s*"robots",\s*content:\s*"noindex, nofollow"/, `${rel} missing noindex`);
  }
});

test("OG head injection preserves canonical, og:url, og:site_name, og:locale and emits og:type website", () => {
  const site = readOgSite(ROOT);
  assert.equal(site.type, "website");
  assert.equal(site.card, "custom");
  assert.ok(statSync(join(ROOT, "public/og.jpg")).size < 600 * 1024);

  const html = [
    "<!DOCTYPE html><html lang=\"es\"><head>",
    "<title>Bitácora | Auditoría &amp; Investigación EAAB</title>",
    '<meta property="og:site_name" content="Bitácora · TributoApp"/>',
    '<meta property="og:locale" content="es_CO"/>',
    '<meta property="og:url" content="https://bitacora.tributoapp.me/"/>',
    '<link rel="canonical" href="https://bitacora.tributoapp.me/"/>',
    "</head><body></body></html>",
  ].join("");

  const out = injectGrokPwaHead(html, { host: "bitacora.tributoapp.me", cwd: ROOT, site });
  assert.match(out, /rel="canonical" href="https:\/\/bitacora\.tributoapp\.me\/"/);
  assert.match(out, /property="og:url" content="https:\/\/bitacora\.tributoapp\.me\/"/);
  assert.match(out, /property="og:site_name" content="Bitácora · TributoApp"/);
  assert.match(out, /property="og:locale" content="es_CO"/);
  assert.match(out, /property="og:type" content="website"/);
  assert.match(out, /property="og:image" content="https:\/\/bitacora\.tributoapp\.me\/og\.jpg"/);
  assert.match(out, /property="og:title" content="Bitácora \| Auditoría &amp; Investigación EAAB"/);
  assert.match(out, /property="og:description" content="Bitácora de investigación/);
});
