import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/descargar")({
  component: DescargarPage,
});

function readStored() {
  try {
    const href = sessionStorage.getItem("bitacora-word-href") || "";
    const filename = sessionStorage.getItem("bitacora-word-filename") || "Bitacora.docx";
    return { href, filename };
  } catch {
    return { href: "", filename: "Bitacora.docx" };
  }
}

function go(href: string) {
  if (!href) return;
  const abs = href.startsWith("http") ? href : new URL(href, window.location.origin).href;
  window.location.replace(abs);
}

function DescargarPage() {
  const [href, setHref] = useState("");
  const [filename, setFilename] = useState("Bitacora.docx");

  useEffect(() => {
    const apply = (next: string, name?: string) => {
      if (!next) return;
      setHref(next);
      if (name) setFilename(name);
      go(next);
    };

    const stored = readStored();
    if (stored.href) {
      apply(stored.href, stored.filename);
      return;
    }

    let ch: BroadcastChannel | null = null;
    try {
      ch = new BroadcastChannel("bitacora-word");
      ch.onmessage = (ev: MessageEvent<{ href?: string; filename?: string }>) => {
        if (ev.data?.href) apply(ev.data.href, ev.data.filename);
      };
    } catch {
      ch = null;
    }

    const poll = window.setInterval(() => {
      const again = readStored();
      if (again.href) {
        window.clearInterval(poll);
        apply(again.href, again.filename);
      }
    }, 200);

    const timeout = window.setTimeout(() => window.clearInterval(poll), 60000);

    return () => {
      ch?.close();
      window.clearInterval(poll);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center text-ink">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-faint">Bitácora</p>
      <h1 className="mt-2 font-display text-3xl">Guardar Word</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        {href
          ? "Si el archivo no bajó solo, toca el botón."
          : "Generando el documento. Esta pestaña lo guarda en el PC en cuanto esté listo."}
      </p>
      {href ? (
        <a
          href={href}
          download={filename}
          className="mt-6 inline-flex h-12 items-center rounded-sm bg-accent px-5 text-sm font-medium text-accent-fg"
        >
          Guardar {filename}
        </a>
      ) : (
        <p className="mt-6 text-sm text-muted">Esperando el archivo…</p>
      )}
    </div>
  );
}
