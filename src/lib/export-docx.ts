import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  ExternalHyperlink,
} from "docx";
import { ATTACHMENT_KIND_LABEL } from "./seed";
import { formatApa7Citation } from "./apa";
import { formatDateTime } from "./utils";
import { getUniversityLogoUint8Array } from "./university-logo";
import type { BitacoraState, SectionId } from "./types";

// Paleta ejecutiva formal APA 7
const INK = "1E293B";       // Slate 800
const PRIMARY = "0F4C81";   // Classic Navy Blue
const ACCENT = "2563EB";    // Professional Link Blue
const MUTED = "64748B";     // Slate 500
const LINE = "CBD5E1";      // Slate 300
const HEADER_BG = "F1F5F9"; // Slate 100

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: LINE,
};

function cellBorders() {
  return {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  };
}

function p(
  text: string,
  opts?: {
    bold?: boolean;
    size?: number;
    color?: string;
    italics?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spaceAfter?: number;
  },
) {
  return new Paragraph({
    alignment: opts?.align ?? AlignmentType.LEFT,
    spacing: { after: opts?.spaceAfter ?? 140, line: 276 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts?.size ?? 22,
        bold: opts?.bold,
        italics: opts?.italics,
        color: opts?.color ?? INK,
      }),
    ],
  });
}

function heading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1,
) {
  return new Paragraph({
    heading: level,
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        bold: true,
        color: PRIMARY,
        size: level === HeadingLevel.HEADING_1 ? 28 : 24,
      }),
    ],
  });
}

/**
 * Convierte un texto en párrafos de Word, detectando URLs y convirtiéndolas en hipervínculos activos.
 */
function bodyFromText(text: string): Paragraph[] {
  const blocks = text.split(/\n\n+/);
  const out: Paragraph[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    for (const line of lines) {
      const isBullet = /^(•|-)\s+/.test(line);
      const isNum = /^\d+\.\s+/.test(line);
      const clean = line.replace(/^(•|-|\d+\.)\s+/, "");

      // Si la línea es únicamente una URL
      if (/^https?:\/\/[^\s]+$/.test(clean)) {
        out.push(
          new Paragraph({
            bullet: isBullet ? { level: 0 } : undefined,
            indent: isNum ? { left: 360, hanging: 360 } : undefined,
            spacing: { after: 100 },
            children: [
              new ExternalHyperlink({
                link: clean,
                children: [
                  new TextRun({
                    text: clean,
                    font: "Calibri",
                    size: 20,
                    color: ACCENT,
                    underline: {},
                  }),
                ],
              }),
            ],
          }),
        );
        continue;
      }

      // Si la línea contiene texto con o sin URLs intercaladas
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = clean.split(urlRegex);

      const runs: (TextRun | ExternalHyperlink)[] = [];
      for (const part of parts) {
        if (!part) continue;
        if (/^https?:\/\/[^\s]+$/.test(part)) {
          runs.push(
            new ExternalHyperlink({
              link: part,
              children: [
                new TextRun({
                  text: part,
                  font: "Calibri",
                  size: 22,
                  color: ACCENT,
                  underline: {},
                }),
              ],
            }),
          );
        } else {
          // Detectar negritas en formato "Texto:" o títulos de viñetas
          const colonMatch = part.match(/^([^:]+:)(.*)$/);
          if (colonMatch && !isBullet && !isNum) {
            runs.push(
              new TextRun({
                text: colonMatch[1],
                font: "Calibri",
                size: 22,
                bold: true,
                color: INK,
              }),
              new TextRun({
                text: colonMatch[2],
                font: "Calibri",
                size: 22,
                color: INK,
              }),
            );
          } else {
            runs.push(
              new TextRun({
                text: isBullet && runs.length === 0 ? part : part,
                font: "Calibri",
                size: 22,
                color: INK,
              }),
            );
          }
        }
      }

      out.push(
        new Paragraph({
          bullet: isBullet ? { level: 0 } : undefined,
          indent: isNum ? { left: 360, hanging: 360 } : undefined,
          spacing: { after: 120, line: 276 },
          children: runs,
        }),
      );
    }
  }
  return out;
}

function infoTable(rows: [string, string][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2600, 6720],
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2600, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: HEADER_BG },
              borders: cellBorders(),
              margins: { top: 90, bottom: 90, left: 140, right: 140 },
              children: [p(k, { bold: true, size: 20, color: PRIMARY, spaceAfter: 0 })],
            }),
            new TableCell({
              width: { size: 6720, type: WidthType.DXA },
              borders: cellBorders(),
              margins: { top: 90, bottom: 90, left: 140, right: 140 },
              children: [p(v, { size: 20, spaceAfter: 0 })],
            }),
          ],
        }),
    ),
  });
}

export async function buildDocx(state: BitacoraState): Promise<Blob> {
  const named = state.team.filter((m) => m.name.trim());
  const activeStudents =
    named.length > 0
      ? named
      : [
          { id: "s1", name: "BERNAL OSORIO ANDRES", role: "Auditor Líder" },
          { id: "s2", name: "VIZCAINO ESCAMILLA MARIA", role: "Auditora" },
          { id: "s3", name: "MERCADO EGUIS SHADIA", role: "Auditora" },
        ];

  const coverBits: Paragraph[] = [
    // 1. Logotipo Oficial de la Universidad CUL
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 200 },
      children: [
        new ImageRun({
          data: getUniversityLogoUint8Array(),
          transformation: {
            width: 145,
            height: 150,
          },
          type: "png",
        }),
      ],
    }),

    // 2. Título de la Bitácora
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: `Bitácora ${state.company.legalName || state.company.shortName}`,
          font: "Calibri",
          size: 26,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // 3. Integrantes del Equipo (Estudiantes en mayúsculas sostenidas)
    ...activeStudents.map(
      (s) =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: s.name.toUpperCase(),
              font: "Calibri",
              size: 22,
              bold: true,
              color: INK,
            }),
          ],
        }),
    ),

    // 4. Bloque del Docente
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 60 },
      children: [
        new TextRun({
          text: "DOCENTE",
          font: "Calibri",
          size: 20,
          bold: true,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 250 },
      children: [
        new TextRun({
          text: (state.meta.professor?.toUpperCase().includes("RUIZ")
            ? "RUIZ BOTERO WILMER"
            : (state.meta.professor || "RUIZ BOTERO WILMER").toUpperCase()),
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // 5. Bloque de Asignatura
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({
          text: "ASIGNATURA",
          font: "Calibri",
          size: 20,
          bold: true,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: (state.meta.course?.toUpperCase().includes("AUDITORIA")
            ? "ZCPVIIIA AUDITORIA DE SISTEMA"
            : (state.meta.course || "ZCPVIIIA AUDITORIA DE SISTEMA").toUpperCase()),
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // 6. Bloque Institucional Inferior
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: "Corporación Universitaria Latinoamericana",
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: "Contaduría Publica",
          font: "Calibri",
          size: 22,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: "Barranquilla/Atlántico",
          font: "Calibri",
          size: 22,
          color: INK,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      children: [
        new TextRun({
          text: "Colombia",
          font: "Calibri",
          size: 22,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: `${new Date().getFullYear()}`,
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // Salto de página formal para que la portada ocupe su propia hoja
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  const idRows: [string, string][] = [
    ["Entidad Auditada", state.company.legalName || state.company.shortName],
    ["NIT / Identificación Tributaria", state.company.nit],
    ["Domicilio Principal / Sede", state.company.headquarters],
    ["Naturaleza Jurídica", state.company.nature],
    ["Sector Económico", state.company.sector],
    ["Composición / Propietario", state.company.majorityShareholder],
    ["Portal Web Oficial", state.company.website],
    ["Asignatura", state.meta.course || "ZCPVIIIA AUDITORIA DE SISTEMA"],
    ["Alcance de la Auditoría", "Auditoría de Sistemas de Información, Procesos y Cumplimiento Normativo"],
    ["Fecha de Evaluación", `${state.meta.city || "Barranquilla"} · ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`],
  ].filter(([, v]) => v.trim().length > 0) as [string, string][];

  const bodyChildren: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 180 },
      children: [
        new TextRun({
          text: state.company.legalName || state.company.shortName,
          font: "Calibri",
          size: 24,
          bold: true,
          color: PRIMARY,
        }),
      ],
    }),
    heading("1. Ficha de Identificación Institucional"),
    infoTable(idRows),
  ];

  let n = 2;
  const order = state.sectionOrder?.length ? state.sectionOrder : Object.keys(state.sections);
  for (const id of order) {
    const section = state.sections[id as SectionId];
    if (!section) continue;

    bodyChildren.push(heading(`${n}. ${section.title}`));
    bodyChildren.push(...bodyFromText(section.body));

    if (section.notes.trim()) {
      bodyChildren.push(p("Notas y Observaciones de Auditoría:", { bold: true, size: 22, color: PRIMARY }));
      bodyChildren.push(...bodyFromText(section.notes));
    }

    const relatedFiles = state.attachments.filter((a) => a.sectionId === id);
    if (relatedFiles.length) {
      bodyChildren.push(p("Evidencias y Anexos Vinculados:", { bold: true, size: 22, color: PRIMARY }));
      for (const a of relatedFiles) {
        bodyChildren.push(
          p(
            `• ${a.title}  ·  ${ATTACHMENT_KIND_LABEL[a.kind]}${a.fileName ? " (" + a.fileName + ")" : ""}`,
            { bold: true, size: 20 },
          ),
        );
        if (a.extractedText.trim()) {
          bodyChildren.push(...bodyFromText(a.extractedText.slice(0, 4000)));
        }
      }
    }
    n += 1;
  }

  // Sección de Anexos Generales si existen
  if (state.attachments.length) {
    bodyChildren.push(heading(`${n}. Registro Consolidado de Anexos`));
    state.attachments.forEach((a, i) => {
      const sec = state.sections[a.sectionId];
      bodyChildren.push(
        p(
          `${i + 1}. ${a.title} — Sección: ${sec?.title ?? a.sectionId} (${ATTACHMENT_KIND_LABEL[a.kind]}${a.fileName ? " · " + a.fileName : ""})`,
          { size: 20 },
        ),
      );
    });
    n += 1;
  }

  // Sección de Fuentes Consultadas bajo Norma APA 7ª Edición
  bodyChildren.push(heading(`${n}. Referencias y Fuentes Oficiales (Norma APA 7ª Edición)`));
  state.sources.forEach((s, i) => {
    const apaText = formatApa7Citation(s, state.company.legalName || state.company.shortName);
    const parts = apaText.split(/(https?:\/\/[^\s]+)/g);
    const runs: (TextRun | ExternalHyperlink)[] = [
      new TextRun({
        text: `${i + 1}. `,
        bold: true,
        color: PRIMARY,
        font: "Calibri",
        size: 20,
      }),
    ];

    for (const part of parts) {
      if (!part) continue;
      if (/^https?:\/\/[^\s]+$/.test(part)) {
        runs.push(
          new ExternalHyperlink({
            link: part,
            children: [
              new TextRun({
                text: part,
                font: "Calibri",
                size: 20,
                color: ACCENT,
                underline: {},
              }),
            ],
          }),
        );
      } else {
        runs.push(
          new TextRun({
            text: part,
            font: "Calibri",
            size: 20,
            color: INK,
          }),
        );
      }
    }

    bodyChildren.push(
      new Paragraph({
        indent: { left: 400, hanging: 400 },
        spacing: { after: 80, line: 276 },
        children: runs,
      }),
    );

    if (s.notes) {
      bodyChildren.push(
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: `Contexto: ${s.notes}`,
              font: "Calibri",
              size: 18,
              italics: true,
              color: MUTED,
            }),
          ],
        }),
      );
    }
  });

  const pageMargin = { top: 1150, bottom: 1150, left: 1150, right: 1150 };

  const doc = new Document({
    sections: [
      // ── SECCIÓN 1: PORTADA (sin encabezado ni pie de página) ──
      {
        properties: {
          page: { margin: pageMargin },
          titlePage: true,
        },
        children: coverBits,
      },
      // ── SECCIÓN 2: CUERPO DEL DOCUMENTO (con encabezado y pie corporativo) ──
      {
        properties: {
          page: { margin: pageMargin },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Bitácora de Auditoría  ·  ${state.company.shortName} (NIT ${state.company.nit})`,
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Generado: ${formatDateTime(new Date().toISOString())}   ·   Página `,
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Calibri",
                    size: 16,
                    color: MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function publishBlob(blob: Blob, filename: string): Promise<{ href: string; filename: string }> {
  const mime =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const file = new File([blob], filename, { type: mime });
  let href = URL.createObjectURL(file);

  try {
    const fd = new FormData();
    fd.append("file", file, filename);
    fd.append("filename", filename);
    const res = await fetch("/api/word", { method: "POST", body: fd });
    if (res.ok) {
      const data = (await res.json()) as { url?: string };
      if (data.url) href = data.url;
    }
  } catch {
    /* keep blob url */
  }

  try {
    sessionStorage.setItem("bitacora-word-href", href);
    sessionStorage.setItem("bitacora-word-filename", filename);
  } catch {
    /* ignore */
  }

  return { href, filename };
}

export async function downloadBlob(blob: Blob, filename: string) {
  return publishBlob(blob, filename);
}

export function wordFilename(shortName: string) {
  const d = new Date();
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `Bitacora_${shortName}_${stamp}.docx`;
}
