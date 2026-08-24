import type { OrgNode } from "@/lib/types";
import { FILIALES } from "@/lib/seed";

function Box({
  title,
  subtitle,
  tone = "plain",
}: {
  title: string;
  subtitle?: string;
  tone?: "root" | "plain";
}) {
  return (
    <div
      className={
        tone === "root"
          ? "min-w-[12rem] rounded-md border border-accent bg-accent px-3 py-2.5 text-center text-accent-fg"
          : "min-w-[10.5rem] rounded-md border border-line bg-surface px-3 py-2.5 text-center"
      }
    >
      <p className={tone === "root" ? "text-[12px] font-semibold" : "text-[12px] font-semibold text-ink"}>
        {title}
      </p>
      {subtitle ? (
        <p className={tone === "root" ? "mt-0.5 text-[11px] opacity-80" : "mt-0.5 text-[11px] text-muted"}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Spine() {
  return <div className="mx-auto h-4 w-px bg-line-strong" />;
}

export function OrgChart({ tree }: { tree: OrgNode }) {
  const junta = tree.children?.[0];
  const presidencia = junta?.children?.[0];
  const reports = presidencia?.children ?? [];

  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4 sm:p-5">
      <div className="flex flex-col items-center">
        <Box title={tree.title} subtitle={tree.subtitle} tone="root" />
        {junta ? (
          <>
            <Spine />
            <Box title={junta.title} subtitle={junta.subtitle} />
          </>
        ) : null}
        {presidencia ? (
          <>
            <Spine />
            <Box title={presidencia.title} subtitle={presidencia.subtitle} tone="root" />
          </>
        ) : null}
      </div>
      {reports.length > 0 ? (
        <>
          <Spine />
          <div className="mx-auto mb-3 hidden h-px w-[min(100%,36rem)] bg-line-strong sm:block" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((n) => (
              <Box key={n.id} title={n.title} subtitle={n.subtitle} />
            ))}
          </div>
        </>
      ) : null}
      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Filiales del grupo</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILIALES.map((name) => (
            <span
              key={name}
              className="rounded-full border border-line bg-surface px-2.5 py-1 text-[12px] text-ink-soft"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
