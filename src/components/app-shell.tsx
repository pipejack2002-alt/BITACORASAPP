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
  Users,
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

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const progress = useProgress();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-1 pb-4">
        <p className="font-display text-lg leading-tight text-ink">Bitácora</p>
        <p className="mt-0.5 text-[12px] text-muted">Investigación · Word vivo</p>
      </div>
      <nav className="grid gap-0.5">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-2 rounded-sm px-2.5 text-sm",
                active ? "bg-accent text-accent-fg" : "text-ink-soft hover:bg-accent-soft hover:text-accent",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-6 mb-2 px-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
        Secciones
      </p>
      <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
        {sectionOrder.map((id) => {
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
                "flex items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-[13px]",
                active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface-2",
              )}
            >
              <span className="truncate">{s.shortTitle || s.title}</span>
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  s.status === "validado" && "bg-ok",
                  s.status === "en_progreso" && "bg-warn",
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
      <div className="mt-4 rounded-md border border-line bg-surface-2 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Avance</p>
        <p className="mt-1 font-display text-2xl tabular-nums text-ink">{progress.pct}%</p>
        <p className="text-[12px] text-muted">
          {progress.validated}/{progress.total} secciones · {progress.findings} hallazgos
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-accent" style={{ width: `${progress.pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dirty = useBitacora((s) => s.dirty);
  const company = useBitacora((s) => s.company);
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
      <div className="mx-auto flex min-h-dvh max-w-[1400px]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface p-4 lg:flex">
          <NavLinks />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/90 px-3 backdrop-blur-sm sm:px-5">
            <Sheet open={open} onOpenChange={setOpen}>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-sm text-ink lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </button>
              <SheetContent title="Bitácora">
                <NavLinks onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex min-w-0 items-center gap-2">
              <CompanySettingsDialog
                triggerVariant="ghost"
                triggerSize="sm"
                triggerClassName="h-8 px-2 font-normal text-ink hover:bg-surface-2"
                triggerLabel={`${company.shortName}${company.nit ? ` · NIT ${company.nit}` : ""}`}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              {dirty ? (
                <button
                  type="button"
                  onClick={() => {
                    markExported();
                    toast.success("¡Cambios guardados y sincronizados con el Word!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer shadow-xs"
                  title="Haz clic para guardar y sincronizar con el Word"
                >
                  <Save className="size-3.5 animate-pulse" />
                  <span>Guardar cambios</span>
                </button>
              ) : (
                <span className="hidden items-center gap-1.5 rounded-full bg-emerald-700/10 px-2.5 py-1 text-[11px] font-medium text-emerald-800 sm:inline-flex">
                  <Check className="size-3.5 text-emerald-700" />
                  Guardado en tiempo real
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
