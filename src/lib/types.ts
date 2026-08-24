export type SectionId = string;

export type SectionStatus = "pendiente" | "en_progreso" | "validado";

export type SourceType = "oficial" | "reporte" | "norma" | "web" | "otro";

export type AttachmentKind = "pdf" | "word" | "texto" | "otro";

export type UrlCheck = {
  official: boolean;
  live: boolean;
  httpStatus: number | null;
  finalUrl: string;
  checkedAt: string;
  reason: string;
};

export type Source = {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  consultedAt: string;
  notes: string;
  check?: UrlCheck;
};

export type Finding = {
  id: string;
  date: string;
  createdAt: string;
  author: string;
  sectionId: SectionId;
  title: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
};

export type Attachment = {
  id: string;
  sectionId: SectionId;
  title: string;
  kind: AttachmentKind;
  fileName: string;
  mime: string;
  size: number;
  hasFile: boolean;
  extractedText: string;
  notes: string;
  createdAt: string;
  author: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
};

export type Company = {
  shortName: string;
  legalName: string;
  nit: string;
  sector: string;
  founded: string;
  headquarters: string;
  website: string;
  nature: string;
  majorityShareholder: string;
};

export type OrgNode = {
  id: string;
  title: string;
  subtitle?: string;
  children?: OrgNode[];
};

export type Section = {
  id: SectionId;
  title: string;
  shortTitle: string;
  prompt: string;
  status: SectionStatus;
  summary: string;
  body: string;
  bullets: string[];
  notes: string;
  locked?: boolean;
};

export type Meta = {
  course: string;
  institution: string;
  professor: string;
  groupName: string;
  city: string;
};

export type BitacoraState = {
  hydrated: boolean;
  dirty: boolean;
  lastExportAt: string | null;
  meta: Meta;
  team: TeamMember[];
  company: Company;
  sections: Record<SectionId, Section>;
  sectionOrder: SectionId[];
  findings: Finding[];
  sources: Source[];
  attachments: Attachment[];
  orgChart: OrgNode;
  lastDownload: { href: string; filename: string } | null;
  geminiApiKey?: string;
  geminiModel?: string;
};
