import { useEffect, useState, useRef, type ReactNode } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
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

function NavLinks({
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sections = useBitacora((s) => s.sections);
  const sectionOrder = useBitacora((s) => s.sectionOrder);
  const meta = useBitacora((s) => s.meta);
  const progress = useProgress();

  if (isCollapsed) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center">
        {/* Cabecera compacta con logo y botón para expandir */}
        <div className="flex flex-col items-center gap-2 pb-3 border-b border-line/60 w-full">
          <BitacoraLogo size="sm" />
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
              title="Expandir menú lateral"
            >
              <PanelLeftOpen className="size-4 text-accent" />
            </button>
          )}
        </div>

        {/* Navegación principal compacta */}
        <nav className="mt-3 grid gap-1 w-full">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={item.label}
                className={cn(
                  "flex size-9 mx-auto items-center justify-center rounded-md transition-colors",
                  active ? "bg-accent text-accent-fg shadow-xs" : "text-ink-soft hover:bg-accent-soft hover:text-accent",
                )}
              >
                <Icon className="size-4" />
              </Link>
            );
          })}
        </nav>

        {/* Separador */}
        <div className="my-3 h-px w-3/4 bg-line/60 mx-auto" />

        {/* Lista compacta de secciones con números circulares y tooltip */}
        <nav className="min-h-0 flex-1 overflow-y-auto w-full space-y-1.5 pr-0.5">
          {/* Columna 0 */}
          <Link
            to="/seccion/$id"
            params={{ id: "0" }}
            onClick={onNavigate}
            title="0. Ficha Institucional y Portada"
            className={cn(
              "flex size-8 mx-auto items-center justify-center rounded-full text-xs font-bold transition-all",
              pathname === "/seccion/0" || pathname === "/seccion/ficha"
                ? "bg-accent text-accent-fg shadow-xs ring-2 ring-accent/30"
                : "bg-accent-soft text-accent hover:bg-accent hover:text-accent-fg",
            )}
          >
            0
          </Link>

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
                title={`${i + 1}. ${s.shortTitle || s.title} (${STATUS_LABEL[s.status]})`}
                className={cn(
                  "relative flex size-8 mx-auto items-center justify-center rounded-full text-xs transition-colors",
                  active
                    ? "bg-accent text-accent-fg font-bold"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink font-medium",
                )}
              >
                <span>{i + 1}</span>
                <span
                  className={cn(
                    "absolute top-0 right-0 size-2 rounded-full ring-1 ring-bg",
                    s.status === "validado" && "bg-ok",
                    s.status === "en_progreso" && "bg-warn",
                    s.status === "pendiente" && "bg-line-strong",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Progreso compacto */}
        <div
          title={`Avance: ${progress.pct}% (${progress.validated}/${progress.total} listas completas)`}
          className="mt-2 flex flex-col items-center justify-center rounded-lg border border-line bg-surface-2 p-1.5 w-full text-center"
        >
          <span className="text-[10px] font-bold text-accent tabular-nums">{progress.pct}%</span>
        </div>
      </div>
    );
  }

  // MODO EXPANDIDO COMPLETO
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
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
            title="Contraer menú lateral"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
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
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
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
        {/* Columna 0: Ficha Institucional y Portada */}
        <Link
          to="/seccion/$id"
          params={{ id: "0" }}
          onClick={onNavigate}
          className={cn(
            "flex items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-[12.5px] transition-colors",
            pathname === "/seccion/0" || pathname === "/seccion/ficha"
              ? "bg-accent-soft text-accent font-semibold"
              : "text-ink-soft hover:bg-surface-2",
          )}
        >
          <span className="truncate">
            <span className="text-accent font-bold mr-1.5 text-[11px]">0.</span>
            Ficha Institucional y Portada
          </span>
          <span
            className="size-1.5 shrink-0 rounded-full bg-ok ring-2 ring-ok/20"
            title="Datos Oficiales Validados"
          />
        </Link>

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
        <p className="mt-1 text-[12px] text-muted truncate">
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

  // Estados para sidebar redimensionable y colapsable
  const [sidebarWidth, setSidebarWidth] = useState(285);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const widthRef = useRef(sidebarWidth);
  widthRef.current = sidebarWidth;

  useEffect(() => {
    const done = Promise.resolve(useBitacora.persist.rehydrate());
    void done.finally(() => {
      if (!useBitacora.getState().hydrated) useBitacora.getState().setHydrated(true);
    });

    try {
      const savedWidth = localStorage.getItem("bitacora_sidebar_width");
      if (savedWidth) {
        const parsed = Number(savedWidth);
        if (!isNaN(parsed) && parsed >= 210 && parsed <= 520) {
          setSidebarWidth(parsed);
        }
      }
      const savedCollapsed = localStorage.getItem("bitacora_sidebar_collapsed");
      if (savedCollapsed) {
        setIsCollapsed(savedCollapsed === "true");
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bitacora_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const clamped = Math.max(210, Math.min(520, e.clientX));
      setSidebarWidth(clamped);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem("bitacora_sidebar_width", String(widthRef.current));
      } catch {}
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

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
      <div className="mx-auto flex min-h-dvh max-w-[1600px]">
        {/* Barra Lateral Redimensionable y Colapsable (Desktop) */}
        <aside
          style={{ width: isCollapsed ? 68 : sidebarWidth }}
          className={cn(
            "relative sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex",
            isDragging && "transition-none select-none cursor-col-resize",
            isCollapsed ? "p-2" : "p-4",
          )}
        >
          <NavLinks
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
          />

          {/* Manija para arrastrar y cambiar el ancho (Resize Handle) */}
          {!isCollapsed && (
            <div
              onMouseDown={handleMouseDown}
              onDoubleClick={() => {
                setSidebarWidth(285);
                try {
                  localStorage.setItem("bitacora_sidebar_width", "285");
                } catch {}
                toast.info("Ancho del menú restablecido a 285px");
              }}
              className="group absolute -right-2 top-0 z-40 h-full w-4 cursor-col-resize select-none flex items-center justify-center hover:bg-accent/10 transition-colors"
              title="Arrastra para cambiar el ancho (Doble clic para restablecer a 285px)"
            >
              <div className="h-10 w-1 rounded-full bg-line-strong/60 transition-all group-hover:bg-accent group-hover:h-16 group-active:bg-accent" />
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-bg/95 px-3 backdrop-blur-sm sm:px-5">
            {/* Botón de navegación móvil */}
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

            {/* Botón en header para contraer / expandir sidebar desktop */}
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:inline-flex items-center justify-center size-9 rounded-md text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors cursor-pointer"
              title={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            >
              {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>

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
