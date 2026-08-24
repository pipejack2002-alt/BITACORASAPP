import { useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Source } from "@/lib/types";
import { SOURCE_TYPE_LABEL } from "@/lib/seed";
import { checkLabel, requestUrlCheck } from "@/lib/official-url";
import { useBitacora } from "@/lib/store";

export function SourceLinks({
  sources,
  title = "Fuentes para validar",
}: {
  sources: Source[];
  title?: string;
}) {
  const updateSource = useBitacora((s) => s.updateSource);
  const [busy, setBusy] = useState(false);

  async function validateAll() {
    setBusy(true);
    try {
      let ok = 0;
      let fail = 0;
      for (const s of sources) {
        if (!s.url) continue;
        const check = await requestUrlCheck(s.url);
        updateSource(s.id, { check });
        if (check.official && check.live) ok += 1;
        else fail += 1;
      }
      toast.success("Validación lista", {
        description: `${ok} oficiales que responden · ${fail} con alerta`,
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron consultar las URLs.");
    } finally {
      setBusy(false);
    }
  }

  if (sources.length === 0) return null;
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            Solo cuentan acueducto.com.co o .gov.co, y que el enlace abra.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => void validateAll()} disabled={busy}>
          <ShieldCheck className="size-4" />
          {busy ? "Validando…" : "Validar URLs oficiales"}
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {sources.map((s) => {
          const stamp = s.check ? checkLabel(s.check) : null;
          return (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-2 rounded-lg border border-line p-3 hover:border-line-strong hover:bg-surface-2"
              >
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink group-hover:text-accent">{s.name}</span>
                    {stamp ? <Badge tone={stamp.tone}>{stamp.text}</Badge> : (
                      <Badge>Sin validar aún</Badge>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {SOURCE_TYPE_LABEL[s.type]}
                    {s.notes ? ` · ${s.notes}` : ""}
                    {s.check ? ` · ${s.check.reason}` : ""}
                  </span>
                  <span className="mt-1 block break-all text-[12px] text-accent">{s.url}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const URL_RE = /(https?:\/\/[^\s]+)/g;

export function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (!part.startsWith("http")) return <span key={i}>{part}</span>;
        const trailing = part.match(/[),.;]+$/)?.[0] ?? "";
        const href = trailing ? part.slice(0, -trailing.length) : part;
        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="break-all text-accent underline-offset-2 hover:underline"
            >
              {href}
            </a>
            {trailing}
          </span>
        );
      })}
    </p>
  );
}
