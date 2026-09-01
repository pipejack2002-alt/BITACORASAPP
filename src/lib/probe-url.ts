import https from "node:https";
import { classifyOfficial } from "./official-url";
import type { UrlCheck } from "./types";

export const AUDITOR_UA = "BitacoraAuditor/1.0 (+https://x.ai)";

function looseHead(url: string): Promise<{ status: number; finalUrl: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: `${u.pathname}${u.search}`,
        method: "HEAD",
        rejectUnauthorized: false,
        timeout: 12000,
        headers: { "User-Agent": AUDITOR_UA },
      },
      (res) => {
        const loc = res.headers.location;
        const status = res.statusCode ?? 0;
        res.resume();
        if (loc && status >= 300 && status < 400) {
          const next = new URL(loc, url).href;
          looseHead(next).then(resolve, reject);
          return;
        }
        resolve({ status, finalUrl: url });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.end();
  });
}

export async function probeUrl(url: string, companyWebsite?: string): Promise<UrlCheck> {
  const local = classifyOfficial(url, companyWebsite);
  const checkedAt = new Date().toISOString();
  if (!local.host) {
    return {
      official: false,
      live: false,
      httpStatus: null,
      finalUrl: url,
      checkedAt,
      reason: local.reason,
    };
  }
  const headers = { "User-Agent": AUDITOR_UA, Accept: "*/*" };
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers,
      signal: AbortSignal.timeout(12000),
    });
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { ...headers, Range: "bytes=0-1023" },
        signal: AbortSignal.timeout(12000),
      });
    }
    const finalUrl = res.url || url;
    const live = res.status >= 200 && res.status < 400;
    const finalHost = classifyOfficial(finalUrl, companyWebsite);
    if (live) {
      return {
        official: local.official || finalHost.official,
        live,
        httpStatus: res.status,
        finalUrl,
        checkedAt,
        reason:
          finalHost.official || local.official
            ? `${local.reason || finalHost.reason} · HTTP ${res.status}`
            : `HTTP ${res.status}, pero ${finalHost.reason}`,
      };
    }
    throw new Error(`HTTP ${res.status}`);
  } catch {
    if (!local.official) {
      return {
        official: false,
        live: false,
        httpStatus: null,
        finalUrl: url,
        checkedAt,
        reason: local.reason,
      };
    }
    try {
      const fallback = await looseHead(url);
      const live = fallback.status >= 200 && fallback.status < 400;
      return {
        official: true,
        live,
        httpStatus: fallback.status,
        finalUrl: fallback.finalUrl,
        checkedAt,
        reason: `${local.reason} · HTTP ${fallback.status}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error de red";
      return {
        official: true,
        live: false,
        httpStatus: null,
        finalUrl: url,
        checkedAt,
        reason: `Dominio oficial, pero no se alcanzó (${msg.slice(0, 80)})`,
      };
    }
  }
}
