import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Check,
  ClipboardList,
  FileText,
  Menu,
  Paperclip,
  Save,
  Sparkles,
  Users,
  GraduationCap,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { STATUS_LABEL } from "@/lib/seed";
import { useBitacora, useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AddSectionDialog } from "@/components/add-section-dialog";
import { DownloadWordButton } from "@/components/download-word";
import { GeminiAssistantModal } from "@/components/gemini-assistant";
import { CompanySettingsDialog } from "@/components/company-settings-dialog";

const NAV = [
  { to: "/", label: "Tablero", icon: ClipboardList },
  { to: "/bitacora", label: "Bitácora", icon: BookOpen },
  { to: "/anexos", label: "Anexos", icon: Paperclip },
  { to: "/documento", label: "Documento", icon: FileText },
  { to: "/equipo", label: "Equipo", icon: Users },
];

function BitacoraLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "size-7 rounded-lg p-1",
    md: "size-9 rounded-xl p-1.5",
    lg: "size-11 rounded-2xl p-2",
  }[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-gradient-to-br from-emerald-700 via-emerald-900 to-teal-950 text-amber-300 shadow-md border border-emerald-600/40 ring-1 ring-amber-400/20",
        sizeClasses,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-full drop-shadow-xs" stroke="currentColor">
        <path
          d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
          fill="#064e3b"
          stroke="#f59e0b"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M7 6.5h8M7 10h8M7 13.5h5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <circle cx="15.5" cy="14.5" r="2.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
        <path d="M15.5 17l1.5 3.5-2-1-2 1 1-3.5" fill="#f59e0b" />
      </svg>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const meta = useBitacora((s) => s.meta);
  const progress = useProgress();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 px-1 pb-4 border-b border-line/60">
        <BitacoraLogo size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-tight text-ink tracking-tight flex items-center gap-1.5">
            <span>Bitácora</span>
            <span className="rounded-full bg-emerald-700/15 px-1.5 py-0.2 text-[10px] font-bold tracking-wide text-emerald-800">
              CUL
            </span>
          </p>
          <p className="mt-0.5 truncate text-[11px] font-medium text-muted">
            {meta.course || "Auditoría de Sistemas"} · 8° Sem.
          </p>
        </div>
      </div>

      <nav className="mt-3 grid gap-0.5">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex h-9.5 items-center gap-2 rounded-sm px-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent text-accent-fg shadow-xs" : "text-ink-soft hover:bg-accent-soft hover:text-accent",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 mb-1.5 flex items-center justify-between px-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          Secciones de Auditoría
        </p>
        <span className="text-[10px] font-bold text-muted tabular-nums">
          {progress.validated}/{progress.total}
        </span>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
        {sectionOrder.map((id, i) => {
          const s = sections[id];
          if (!s) return null;
          const to = `/seccion/${id}`;
          const active = pathname === to;
          return (
            <Link
              key={id}
              to="/seccion/$id"
              params={{ id }}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-[12.5px] transition-colors",
                active ? "bg-accent-soft text-accent font-semibold" : "text-ink-soft hover:bg-surface-2",
              )}
            >
              <span className="truncate">
                <span className="text-muted mr-1.5 text-[11px]">{i + 1}.</span>
                {s.shortTitle || s.title}
              </span>
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  s.status === "validado" && "bg-ok ring-2 ring-ok/20",
                  s.status === "en_progreso" && "bg-warn ring-2 ring-warn/20",
                  s.status === "pendiente" && "bg-line-strong",
                )}
                title={STATUS_LABEL[s.status]}
              />
            </Link>
          );
        })}
        <div className="mt-2 px-1">
          <AddSectionDialog />
        </div>
      </nav>

      <div className="mt-3 rounded-xl border border-line bg-surface-2 p-3 shadow-xs">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Avance Bitácora</p>
          <span className="text-[11px] font-bold text-accent tabular-nums">{progress.pct}%</span>
        </div>
        <p className="mt-1 text-[12px] text-muted">
          {progress.validated} de {progress.total} listas · {progress.findings} hallazgos
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress.pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dirty = useBitacora((s) => s.dirty);
  const company = useBitacora((s) => s.company);
  const meta = useBitacora((s) => s.meta);
  const markExported = useBitacora((s) => s.markExported);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const done = Promise.resolve(useBitacora.persist.rehydrate());
    void done.finally(() => {
      if (!useBitacora.getState().hydrated) useBitacora.getState().setHydrated(true);
    });
  }, []);

  if (pathname === "/descargar") {
    return (
      <div className="min-h-dvh bg-bg text-ink">
        <Toaster position="bottom-center" richColors />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <Toaster position="bottom-center" richColors />
      <div className="mx-auto flex min-h-dvh max-w-[1440px]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface p-4 lg:flex">
          <NavLinks />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/95 px-3 backdrop-blur-sm sm:px-5">
            <Sheet open={open} onOpenChange={setOpen}>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-sm text-ink lg:hidden hover:bg-surface-2"
                onClick={() => setOpen(true)}
                aria-label="Abrir menú de navegación"
              >
                <Menu className="size-5" />
              </button>
              <SheetContent title="Menú de Navegación">
                <NavLinks onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex min-w-0 items-center gap-2">
              <CompanySettingsDialog
                triggerVariant="ghost"
                triggerSize="sm"
                triggerClassName="h-8.5 px-2.5 font-medium text-ink hover:bg-surface-2 border border-line/60 rounded-md"
                triggerLabel={`${company.shortName || "Empresa"}${company.nit ? ` · NIT ${company.nit}` : ""}`}
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              {dirty ? (
                <button
                  type="button"
                  onClick={() => {
                    markExported();
                    toast.success("¡Cambios guardados y sincronizados con el reporte Word!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Haz clic para guardar y sincronizar con el Word"
                >
                  <Save className="size-3.5 animate-pulse" />
                  <span>Guardar</span>
                </button>
              ) : (
                <span className="hidden items-center gap-1.5 rounded-full bg-emerald-700/10 px-2.5 py-1 text-[11px] font-medium text-emerald-800 sm:inline-flex">
                  <Check className="size-3.5 text-emerald-700" />
                  Sincronizado
                </span>
              )}
              <GeminiAssistantModal triggerVariant="secondary" triggerSize="sm" />
              <DownloadWordButton size="sm" />
            </div>
          </header>
          <main className="flex-1 px-3 py-5 sm:px-6 sm:py-7">{children}</main>
        </div>
      </div>
    </div>
  );
}
