import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createInitialState, PDF_ORGANIGRAMA, SECTION_ORDER, URL_FINANCIERA } from "./seed";
import { uid, todayISO, shortTitleFrom } from "./utils";
import { deleteBlob } from "./files-idb";
import type {
  Attachment,
  BitacoraState,
  Company,
  Finding,
  Meta,
  Section,
  SectionId,
  SectionStatus,
  Source,
  TeamMember,
} from "./types";

type Actions = {
  setHydrated: (v: boolean) => void;
  markDirty: () => void;
  markExported: () => void;
  updateMeta: (patch: Partial<Meta>) => void;
  updateCompany: (patch: Partial<Company>) => void;
  updateTeam: (id: string, patch: Partial<TeamMember>) => void;
  updateSection: (
    id: SectionId,
    patch: Partial<{
      body: string;
      summary: string;
      notes: string;
      status: SectionStatus;
      bullets: string[];
      title: string;
      shortTitle: string;
      prompt: string;
    }>,
  ) => void;
  addSection: (title: string) => SectionId;
  removeSection: (id: SectionId) => void;
  addFinding: (input: Omit<Finding, "id" | "createdAt">) => void;
  updateFinding: (id: string, patch: Partial<Finding>) => void;
  removeFinding: (id: string) => void;
  addSource: (input: Omit<Source, "id">) => void;
  updateSource: (id: string, patch: Partial<Source>) => void;
  removeSource: (id: string) => void;
  resetContent: () => void;
  setLastDownload: (file: { href: string; filename: string } | null) => void;
  addAttachment: (input: Omit<Attachment, "id" | "createdAt">) => string;
  updateAttachment: (id: string, patch: Partial<Attachment>) => void;
  removeAttachment: (id: string) => void;
  importState: (imported: Partial<BitacoraState>) => void;
  setGeminiKey: (key: string) => void;
  setGeminiModel: (model: string) => void;
};

const memory = new Map<string, string>();

const safeStorage = {
  getItem: (name: string) => {
    try {
      if (typeof window === "undefined") return memory.get(name) ?? null;
      return window.localStorage.getItem(name) ?? memory.get(name) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name: string, value: string) => {
    memory.set(name, value);
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(name, value);
    } catch {
      /* iframe or private mode */
    }
  },
  removeItem: (name: string) => {
    memory.delete(name);
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useBitacora = create<BitacoraState & Actions>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      setHydrated: (v) => set({ hydrated: v }),
      markDirty: () => set({ dirty: true }),
      markExported: () =>
        set({ dirty: false, lastExportAt: new Date().toISOString() }),
      updateMeta: (patch) =>
        set((s) => ({ meta: { ...s.meta, ...patch }, dirty: true })),
      updateCompany: (patch) =>
        set((s) => ({ company: { ...s.company, ...patch }, dirty: true })),
      updateTeam: (id, patch) =>
        set((s) => ({
          team: s.team.map((m) => (m.id === id ? { ...m, ...patch } : m)),
          dirty: true,
        })),
      updateSection: (id, patch) =>
        set((s) => {
          const current = s.sections[id];
          if (!current) return s;
          const next = { ...current, ...patch };
          if (patch.title && !patch.shortTitle) next.shortTitle = shortTitleFrom(patch.title);
          return {
            sections: { ...s.sections, [id]: next },
            dirty: true,
          };
        }),
      addSection: (title) => {
        const name = title.trim() || "Nueva sección";
        const id = `c-${uid().slice(0, 8)}`;
        const section: Section = {
          id,
          title: name,
          shortTitle: shortTitleFrom(name),
          prompt: "Suban PDF o Word, peguen el avance, o escriban el hallazgo. Renombren la sección si el encargo cambia.",
          status: "pendiente",
          summary: "Sin evidencia todavía. Carguen el documento o el párrafo a auditar.",
          body: `Sección creada por el equipo: ${name}.\n\nUsen esta ficha para el avance. Suban el PDF o Word, peguen cifras o políticas, y marquen el estado (sin avance / en avance / listo). Si el profesor pide otro tema, renombren el título: el contenido y los archivos se quedan.`,
          bullets: [],
          notes: "",
          locked: false,
        };
        set((s) => ({
          sections: { ...s.sections, [id]: section },
          sectionOrder: [...s.sectionOrder, id],
          dirty: true,
        }));
        return id;
      },
      removeSection: (id) => {
        const current = get().sections[id];
        if (!current) return;
        const files = get().attachments.filter((a) => a.sectionId === id);
        void Promise.all(files.map((a) => deleteBlob(a.id).catch(() => undefined)));
        set((s) => {
          const { [id]: _removed, ...rest } = s.sections;
          return {
            sections: rest,
            sectionOrder: s.sectionOrder.filter((x) => x !== id),
            findings: s.findings.filter((f) => f.sectionId !== id),
            attachments: s.attachments.filter((a) => a.sectionId !== id),
            dirty: true,
          };
        });
      },
      addFinding: (input) =>
        set((s) => ({
          findings: [
            {
              ...input,
              id: uid(),
              createdAt: new Date().toISOString(),
            },
            ...s.findings,
          ],
          dirty: true,
        })),
      updateFinding: (id, patch) =>
        set((s) => ({
          findings: s.findings.map((f) => (f.id === id ? { ...f, ...patch } : f)),
          dirty: true,
        })),
      removeFinding: (id) =>
        set((s) => ({
          findings: s.findings.filter((f) => f.id !== id),
          dirty: true,
        })),
      addSource: (input) =>
        set((s) => ({
          sources: [{ ...input, id: uid() }, ...s.sources],
          dirty: true,
        })),
      updateSource: (id, patch) =>
        set((s) => ({
          sources: s.sources.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeSource: (id) =>
        set((s) => ({
          sources: s.sources.filter((x) => x.id !== id),
          dirty: true,
        })),
      resetContent: () => {
        const ids = get().attachments.map((a) => a.id);
        void Promise.all(ids.map((id) => deleteBlob(id).catch(() => undefined)));
        const fresh = createInitialState();
        set((s) => ({
          ...fresh,
          hydrated: true,
          team: s.team,
          meta: s.meta,
          dirty: false,
          lastExportAt: s.lastExportAt,
          lastDownload: s.lastDownload,
        }));
      },
      setLastDownload: (file) => set({ lastDownload: file }),
      addAttachment: (input) => {
        const id = uid();
        set((s) => {
          const section = s.sections[input.sectionId];
          const nextStatus =
            section?.status === "pendiente" ? "en_progreso" : section?.status;
          return {
            attachments: [
              {
                ...input,
                id,
                createdAt: new Date().toISOString(),
              },
              ...s.attachments,
            ],
            sections:
              section && nextStatus !== section.status
                ? {
                    ...s.sections,
                    [input.sectionId]: { ...section, status: nextStatus },
                  }
                : s.sections,
            dirty: true,
          };
        });
        return id;
      },
      updateAttachment: (id, patch) =>
        set((s) => ({
          attachments: s.attachments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          dirty: true,
        })),
      removeAttachment: (id) => {
        void deleteBlob(id).catch(() => undefined);
        set((s) => ({
          attachments: s.attachments.filter((a) => a.id !== id),
          dirty: true,
        }));
      },
      importState: (imported) => {
        set((s) => ({
          ...s,
          ...imported,
          meta: imported.meta ? { ...s.meta, ...imported.meta } : s.meta,
          team: imported.team ?? s.team,
          company: imported.company ? { ...s.company, ...imported.company } : s.company,
          sections: imported.sections ? { ...s.sections, ...imported.sections } : s.sections,
          sectionOrder: imported.sectionOrder ?? s.sectionOrder,
          findings: imported.findings ?? s.findings,
          sources: imported.sources ?? s.sources,
          attachments: imported.attachments ?? s.attachments,
          orgChart: imported.orgChart ?? s.orgChart,
          geminiApiKey: imported.geminiApiKey ?? s.geminiApiKey,
          geminiModel: imported.geminiModel ?? s.geminiModel,
          dirty: true,
          hydrated: true,
        }));
      },
      setGeminiKey: (key) => set({ geminiApiKey: key.trim() }),
      setGeminiModel: (model) => set({ geminiModel: model }),
    }),
    {
      name: "bitacora-eaab-v2",
      skipHydration: true,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        meta: s.meta,
        team: s.team,
        company: s.company,
        sections: s.sections,
        sectionOrder: s.sectionOrder,
        findings: s.findings,
        sources: s.sources,
        attachments: s.attachments,
        orgChart: s.orgChart,
        dirty: s.dirty,
        lastExportAt: s.lastExportAt,
        geminiApiKey: s.geminiApiKey,
        geminiModel: s.geminiModel,
      }),
      merge: (persisted, current) => {
        let p = (persisted ?? {}) as Partial<BitacoraState>;
        
        // Si no tiene clave de Gemini en v2, migrar de v1 si existe
        if (!p.geminiApiKey && typeof window !== "undefined") {
          try {
            const oldV1 = window.localStorage.getItem("bitacora-eaab-v1");
            if (oldV1) {
              const parsedV1 = JSON.parse(oldV1)?.state;
              if (parsedV1?.geminiApiKey) p.geminiApiKey = parsedV1.geminiApiKey;
              if (parsedV1?.geminiModel) p.geminiModel = parsedV1.geminiModel;
            }
          } catch {
            /* ignore */
          }
        }
        const sections = { ...current.sections, ...p.sections };
        for (const id of SECTION_ORDER) {
          if (!sections[id]) sections[id] = current.sections[id];
        }
        for (const id of Object.keys(sections)) {
          if (typeof sections[id].locked !== "boolean") {
            sections[id] = {
              ...sections[id],
              locked: SECTION_ORDER.includes(id),
            };
          }
        }
        const order = [...(p.sectionOrder ?? [])];
        for (const id of SECTION_ORDER) {
          if (!order.includes(id)) order.push(id);
        }
        const known = new Set(Object.keys(sections));
        const sources = (p.sources ?? current.sources).map((s) => {
          if (s.id === "s3") return { ...s, url: PDF_ORGANIGRAMA };
          if (s.id === "s10") return { ...s, url: URL_FINANCIERA };
          return s;
        });
        return {
          ...current,
          ...p,
          sections,
          sources,
          sectionOrder: order.filter((id) => known.has(id)),
          attachments: p.attachments ?? [],
          lastDownload: null,
          hydrated: true,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useProgress() {
  const sections = useBitacora((s) => s.sections);
  const findings = useBitacora((s) => s.findings);
  const attachments = useBitacora((s) => s.attachments);
  const team = useBitacora((s) => s.team);
  const list = Object.values(sections);
  const validated = list.filter((x) => x.status === "validado").length;
  const inProgress = list.filter((x) => x.status === "en_progreso").length;
  const named = team.filter((m) => m.name.trim()).length;
  return {
    total: list.length,
    validated,
    inProgress,
    pending: list.length - validated - inProgress,
    findings: findings.length,
    attachments: attachments.length,
    named,
    pct: Math.round((validated / list.length) * 100),
  };
}

export { todayISO };