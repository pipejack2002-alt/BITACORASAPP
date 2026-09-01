import fs from 'fs';
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
} from 'docx';

const INK = "1E293B";       // Slate 800
const PRIMARY = "0F4C81";   // Classic Navy Blue
const ACCENT = "2563EB";    // Link Blue
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
  text,
  opts
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

function heading(text, level = HeadingLevel.HEADING_1) {
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

function bodyFromText(text) {
  const blocks = text.split(/\n\n+/);
  const out = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    for (const line of lines) {
      const isBullet = /^(•|-)\s+/.test(line);
      const isNum = /^\d+\.\s+/.test(line);
      const clean = line.replace(/^(•|-|\d+\.)\s+/, "");

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

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = clean.split(urlRegex);

      const runs = [];
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
                text: part,
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

function infoTable(rows) {
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

async function run() {
  const logoBuffer = fs.readFileSync('./public/university-logo.png');

  const coverBits = [
    // 1. Logotipo Oficial CUL
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 200 },
      children: [
        new ImageRun({
          data: logoBuffer,
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
          text: "Bitácora Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
          font: "Calibri",
          size: 26,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // 3. Estudiantes del Equipo en mayúsculas sostenidas
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "BERNAL OSORIO ANDRES",
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "VIZCAINO ESCAMILLA MARIA",
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "MERCADO EGUIS SHADIA",
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // 4. Bloque Docente
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
          text: "RUIZ BOTERO WILMER",
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // 5. Bloque Asignatura
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
          text: "ZCPVIIIA AUDITORIA DE SISTEMA",
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
          text: "2026",
          font: "Calibri",
          size: 22,
          bold: true,
          color: INK,
        }),
      ],
    }),

    // Salto de página para que la portada ocupe su propia hoja
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  const idRows = [
    ["Entidad Auditada", "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)"],
    ["Sigla / Nombre Comercial", "EAAB-ESP"],
    ["NIT / Identificación Tributaria", "899.999.094-1"],
    ["Domicilio Principal / Sede", "Avenida Calle 24 No. 37-15, Bogotá D.C., Colombia"],
    ["Naturaleza Jurídica", "Empresa Industrial y Comercial del Estado (EICE) del orden distrital"],
    ["Sector Económico", "Servicios públicos domiciliarios: acueducto y alcantarillado"],
    ["Composición / Propietario", "100% pública (Distrito Capital de Bogotá)"],
    ["Portal Web Oficial", "https://www.acueducto.com.co"],
    ["Asignatura", "Auditoría de Sistemas (8° Semestre)"],
    ["Alcance de la Auditoría", "Auditoría de Sistemas de Información, Procesos y Cumplimiento Normativo"],
    ["Fecha de Evaluación", `Barranquilla · ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}`],
  ];

  const sectionsData = [
    {
      title: "La empresa",
      body: `Identidad y Datos Corporativos:
• Razón Social: Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)
• NIT: 899.999.094-1
• Sede Principal: Avenida Calle 24 No. 37-15, Bogotá D.C., Colombia
• Contacto Oficial: PBX (+57) 601 344 7000 · Línea de Atención 116 · Portal: https://www.acueducto.com.co

Naturaleza Jurídica y Objeto Social:
• Naturaleza: Empresa Industrial y Comercial del Estado (EICE) del orden distrital, con personería jurídica, autonomía administrativa y capital 100% público del Distrito Capital.
• Objeto Social: Prestación integral de los servicios públicos esenciales de captación, potabilización, distribución de agua potable y recolección y tratamiento de aguas residuales en Bogotá y municipios conurbados de la sabana.
• Relevancia para Auditoría: Sujetada al control fiscal de la Contraloría Distrital, vigilancia de la SSPD/CRA y obligaciones de transparencia bajo la Ley 1712 de 2014.

Fuentes Oficiales Verificadas:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/terminos_condiciones_uso
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`
    },
    {
      title: "Misión",
      body: `Misión Institucional Oficial:

“Somos una Empresa pública que crea valor, para la vida y el bienestar, a través de la gestión integral del agua, garantizando de forma sostenible la óptima prestación de los servicios de acueducto y alcantarillado.”

Análisis de Componentes Estratégicos:
• Creación de Valor Público: Orientación hacia la calidad de vida, salud pública y bienestar comunitario.
• Gestión Integral del Recurso: Responsabilidad en todo el ciclo hídrico, desde la cuenca hasta la disposición final.
• Sostenibilidad Operativa: Compromiso con la eficiencia técnica, resiliencia ambiental y viabilidad financiera.

Fuentes Oficiales Verificadas:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes
https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision`
    },
    {
      title: "Visión",
      body: `Visión Institucional Oficial:

“Ser referente de gestión pública eficiente y responsable, que crece e impulsa el desarrollo sostenible del territorio.”

Pilares de Proyección Estratégica:
• Liderazgo y Referente Sectorial: Benchmark de excelencia en la prestación de servicios públicos domiciliarios.
• Eficiencia y Responsabilidad: Gestión transparente, optimización de recursos y probidad administrativa.
• Impacto Territorial: Aporte al desarrollo socioeconómico regional y adaptación al cambio climático.

Fuentes Oficiales Verificadas:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes
https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision`
    },
    {
      title: "Valores corporativos",
      body: `Marco Ético y Valores Corporativos:

La entidad define formalmente seis valores fundamentales que rigen la conducta y cultura de sus colaboradores:

• Honestidad: Actuar siempre con apego a la verdad, rectitud y transparencia, anteponiendo el interés general.
• Diligencia: Desempeñar funciones con prontitud, eficiencia y cuidado para optimizar los recursos del Estado.
• Respeto: Valorar y tratar con dignidad, equidad e inclusión a todas las personas y grupos de interés.
• Compromiso: Disposición permanente para resolver las necesidades ciudadanas y generar bienestar colectivo.
• Justicia: Obrar con imparcialidad e igualdad, garantizando los derechos ciudadanos sin discriminación.
• Excelencia Técnica: Cumplir con los más altos estándares operativos, innovación y mejora continua en el servicio.

Fuente Oficial:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes`
    },
    {
      title: "Organigrama",
      body: `Estructura Orgánica y Gobierno Corporativo:

La dirección y administración de la EAAB-ESP se organiza bajo una estructura jerárquica encabezada por la Junta Directiva Distrital y la Gerencia General, liderada por la Dra. Natasha Avendaño García (PBX: +57 601 344 7000 Ext. 7510).

Dependencias y Gerencias Corporativas de Primer Nivel:
• Asesoras y de Gobierno: Secretaría General, Gerencia Jurídica, Oficina de Control Interno y Gestión, Oficina de Control Disciplinario Interno.
• Estratégicas y Planeación: Gerencia Corporativa de Planeamiento y Control, Gerencia Corporativa Financiera.
• Misionales y Operativas: Gerencia Corporativa Sistema Maestro (captación/tratamiento), Gerencia Corporativa Servicio al Cliente (zonas 1 a 5), Gerencia Corporativa Analítica y Pérdidas.
• Soporte y Tecnología: Gerencia de Tecnología (TI), Gerencia Corporativa Gestión Humana y Administrativa, Gerencia Corporativa Ambiental.

Soporte Jurídico: Estructura formalizada mediante Acuerdos de Junta Directiva No. 04 de 2019 y No. 169 de 2023.

Documentos Fuente Oficiales:
https://www.acueducto.com.co/wps/wcm/connect/EAB2/5ceb5863-c366-4ed1-87c1-1f1fb76f2dcc/ORGANIGRAMA+18+DE+AGOSTO+DE+2026.pdf?MOD=AJPERES
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/estructura_org%C3%A1nica_organigrama`
    },
    {
      title: "Normatividad legal",
      body: `Marco Jurídico y Regulatorio Aplicable:

La entidad opera bajo un marco legal integral que garantiza la correcta prestación de servicios públicos esenciales:

• Ley 142 de 1994: Régimen de los Servicios Públicos Domiciliarios en Colombia (objeto social, tarifas y derechos de usuarios).
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752

• Ley 1712 de 2014 & Resolución MinTIC 1519 de 2020: Ley de Transparencia y Acceso a la Información Pública (publicación proactiva obligatoria de instrumentos de gestión).
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882

• Ley 1581 de 2012: Régimen General de Protección de Datos Personales (Habeas Data) en el tratamiento de información ciudadana.

• Órganos de Regulación y Vigilancia: Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA), Superintendencia de Servicios Públicos Domiciliarios (SSPD), Contraloría de Bogotá y Personería Distrital.

Portal de Transparencia y Normatividad:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`
    },
    {
      title: "Normatividad ambiental",
      body: `Marco Normativo y Gestión Ambiental Institucional:

La EAAB-ESP integra la variable ecológica como eje transversal mediante su Gerencia Corporativa Ambiental y los siguientes instrumentos:

• Marco Legal Nacional: Cumplimiento de la Ley 99 de 1993 (SINA) y el Decreto Único Reglamentario 1076 de 2015 para concesión de aguas, permisos de vertimientos y licencias ambientales.
• Sistema de Gestión Ambiental (NTC-ISO 14001): Implementado en el Sistema Único de Gestión (SUG) bajo ciclo PHVA para mitigar impactos operativos.
• Plan Institucional de Gestión Ambiental (PIGA): Instrumento concertado con la Secretaría Distrital de Ambiente (SDA) y la CAR para la conservación de cuencas abastecedoras (Chingaza, Sumapaz, Tibitoc).
• Responsabilidad Hídrica: Programa "Ambientalmente sostenibles" para la protección de fuentes hídricas y el saneamiento del río Bogotá.

Fuentes Oficiales Ambientales:
https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`
    },
    {
      title: "Partes interesadas",
      body: `Caracterización de Grupos de Interés (Partes Interesadas):

La EAAB-ESP formaliza el relacionamiento, rendición de cuentas y atención a expectativas con 9 grupos de valor:

1. Usuarios y Suscriptores: Residenciales, comerciales e industriales (calidad y continuidad del servicio).
2. Comunidad y Ciudadanía: Habitantes de Bogotá y la región metropolitana.
3. Servidores Públicos y Trabajadores Oficiales: Talento humano interno y organizaciones sindicales.
4. Proveedores y Contratistas: Cadena de suministro y prestadores de servicios técnicos.
5. Autoridades y Entes de Control: SSPD, CRA, Ministerios, Contraloría y Personería.
6. Organizaciones Comunitarias y Veedurías: Comités de desarrollo y control social.
7. Medios de Comunicación y Opinión Pública: Difusión y rendición de cuentas pública.
8. Academia y Centros de Investigación: Convenios técnicos y desarrollo científico del sector agua.
9. Junta Directiva y Distrito Capital: Órganos de gobierno corporativo y propietario distrital.

Mecanismos de Control: Aplicación de encuestas periódicas de percepción y satisfacción a 8 grupos para alimentar planes de mejora.

Fuente Oficial:
https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial/grupos%20de%20interes
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`
    },
    {
      title: "Manual de funciones y procedimientos",
      body: `Manual de Funciones, Competencias y Arquitectura de Procesos:

1. Formalización Normativa de Cargos:
• Manual Específico de Funciones y Competencias: Adoptado mediante Resolución 0409 de 2026 (trabajadores oficiales) y Resolución 0537 de 2025.
• Niveles Ocupacionales: Nivel Directivo (decisión y políticas), Nivel Profesional/Técnico (operación, ingeniería y TI) y Nivel Asistencial/Operativo (mantenimiento y plantas).

2. Arquitectura Institucional de Procesos (SUG):
• Procesos Estratégicos: Direccionamiento Corporativo, Planeamiento y Control, y Gestión de Riesgos.
• Procesos Misionales: Captación y aducción, tratamiento de agua potable (Wiesner, Tibitoc), distribución y facturación por zonas, alcantarillado pluvial/sanitario y tratamiento de aguas residuales (PTAR Salitre).
• Procesos de Apoyo: Gestión de Tecnologías de la Información (TI y Ciberseguridad), Gestión Financiera/Contable y Gestión del Talento Humano.
• Procesos de Evaluación y Control: Control Interno y Gestión, Auditoría de Calidad y Control Disciplinario.

3. Relevancia para la Auditoría de Sistemas:
• Constituye la base para auditar la Segregación de Funciones (SoD - Segregation of Duties) en roles operativos y administrativos.
• Soporte para la verificación de matrices de acceso, perfiles de usuario y privilegios en el ERP institucional y sistemas transaccionales.

Fuentes Oficiales:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mapas_cartas_descriptivas
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes`
    },
    {
      title: "Estados financieros",
      body: `Estados Financieros y Situación Presupuestal:

La información económica, financiera y presupuestal de la EAAB-ESP se reporta periódicamente conforme al marco contable público:

• Instrumentos Auditables: Estados de situación financiera (balance general), estado de resultados integrales, estado de flujo de efectivo y reportes de ejecución presupuestal de ingresos y gastos.
• Marco Normativo Contable: Resoluciones de la Contaduría General de la Nación (CGN) para empresas que cotizan o captan recursos del público y reporte a la plataforma CHIP.
• Criterio de Auditoría: Verificación de la razonabilidad de las cifras, capacidad de inversión en infraestructura de acueducto y suficiencia de provisiones para pasivos contingentes.

Fuente Oficial de Reportes:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/planeacion_presupuesto_informes`
    },
    {
      title: "Políticas y sistema de gestión",
      body: `Políticas Institucionales y Sistema Integrado de Gestión:

Directrices estratégicas adoptadas por la entidad para garantizar la calidad del servicio, sostenibilidad y probidad administrativa:

• Sistema Único de Gestión (SUG): Integración certificada de normas técnicas de Calidad (NTC-ISO 9001), Gestión Ambiental (NTC-ISO 14001) y Seguridad y Salud en el Trabajo (NTC-ISO 45001).
• Política de Calidad y Continuidad: Compromiso con los estándares de potabilidad, presión y continuidad del servicio en la red matriz.
• Política de Seguridad de la Información: Directrices para la custodia de datos de usuarios, continuidad tecnológica y protección de activos de información.
• Política de Ética, Integridad y Anticorrupción: Lineamientos para la prevención del fraude, transparencia contractual y canal de denuncias.

Fuente Oficial:
https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial`
    },
  ];

  const sources = [
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Misión, visión, funciones y deberes institucionales",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes",
      notes: "Encabezados literales de Misión, Visión y Valores corporativos.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Portal de Transparencia y Acceso a la Información Pública (Ley 1712 de 2014)",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica",
      notes: "Índice de información obligatoria: estructura, normatividad y planeación.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Organigrama general de la entidad (Actualizado a 18 de agosto de 2026)",
      url: "https://www.acueducto.com.co/wps/wcm/connect/EAB2/5ceb5863-c366-4ed1-87c1-1f1fb76f2dcc/ORGANIGRAMA+18+DE+AGOSTO+DE+2026.pdf?MOD=AJPERES",
      notes: "Gerencia General Dra. Natasha Avendaño García y gerencias corporativas de primer nivel.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Visión y misión empresarial",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision",
      notes: "Publicación institucional de direccionamiento estratégico.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Estructura orgánica y funciones",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/estructura_org%C3%A1nica_organigrama",
      notes: "Ficha técnica de dependencias y acuerdos de Junta Directiva.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Responsabilidad social empresarial y gestión ambiental",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial",
      notes: "Programa 'Ambientalmente sostenibles' y Sistema Único de Gestión.",
    },
    {
      author: "Departamento Administrativo de la Función Pública",
      year: "2014",
      title: "Ley 1712 de 2014 — Ley de Transparencia y del Derecho de Acceso a la Información Pública Nacional",
      url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882",
      notes: "Marco legal para la publicación proactiva de información pública.",
    },
    {
      author: "Departamento Administrativo de la Función Pública",
      year: "1994",
      title: "Ley 142 de 1994 — Régimen de los Servicios Públicos Domiciliarios",
      url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752",
      notes: "Marco regulatorio del objeto social de la EAAB-ESP.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Términos, condiciones y datos corporativos",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/terminos_condiciones_uso",
      notes: "Razón social oficial, NIT 899.999.094-1 y domicilio principal.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Planeación, presupuesto e informes financieros",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/planeacion_presupuesto_informes",
      notes: "Ejecución presupuestal y estados financieros auditados.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Caracterización y diálogo con grupos de interés",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial/grupos%20de%20interes",
      notes: "Identificación de los 9 grupos de valor y encuestas de satisfacción.",
    },
    {
      author: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
      year: "2026",
      title: "Mapas y cartas descriptivas de los procesos institucionales",
      url: "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mapas_cartas_descriptivas",
      notes: "Arquitectura de procesos misionales, estratégicos y de apoyo.",
    },
  ];

  const children = [
    ...coverBits,
    heading("1. Ficha de Identificación Institucional"),
    infoTable(idRows),
  ];

  let n = 2;
  for (const s of sectionsData) {
    children.push(heading(`${n}. ${s.title}`));
    children.push(...bodyFromText(s.body));
    n += 1;
  }

  // Sección de Fuentes Consultadas bajo Norma APA 7ª Edición
  children.push(heading(`${n}. Referencias y Fuentes Oficiales (Norma APA 7ª Edición)`));
  sources.forEach((s, i) => {
    const apaText = `${s.author}. (${s.year}). ${s.title}. Recuperado el 23 de agosto de 2026, de `;
    
    children.push(
      new Paragraph({
        indent: { left: 400, hanging: 400 },
        spacing: { after: 60, line: 276 },
        children: [
          new TextRun({
            text: `${i + 1}. `,
            bold: true,
            color: PRIMARY,
            font: "Calibri",
            size: 20,
          }),
          new TextRun({
            text: apaText,
            font: "Calibri",
            size: 20,
            color: INK,
          }),
          new ExternalHyperlink({
            link: s.url,
            children: [
              new TextRun({
                text: s.url,
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

    if (s.notes) {
      children.push(
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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1150, bottom: 1150, left: 1150, right: 1150 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Bitácora de Auditoría  ·  EAAB-ESP (NIT 899.999.094-1)",
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
                    text: "Corporación Universitaria Latinoamericana (CUL)   ·   Página ",
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
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const targetDir = "C:/Users/andre/OneDrive/Escritorio/UNIVERSIDAD/8 SEMESTRE/AUDITORIA DE SISTEMA";
  const targetPath1 = `${targetDir}/Bitacora_EAAB_2026-08-24.docx`;
  const targetPath2 = `${targetDir}/Bitacora_EAAB_2026-08-31.docx`;
  const targetPath3 = `${targetDir}/Bitacora_EAAB_Optimizada_2026-08-24.docx`;
  
  try {
    fs.writeFileSync(targetPath1, buffer);
    console.log("SUCCESSFULLY SAVED:", targetPath1);
  } catch (e) {
    console.log("Could not overwrite targetPath1 (file might be open):", e.message);
  }

  try {
    fs.writeFileSync(targetPath2, buffer);
    console.log("SUCCESSFULLY SAVED:", targetPath2);
  } catch (e) {
    console.log("Could not write targetPath2:", e.message);
  }

  try {
    fs.writeFileSync(targetPath3, buffer);
    console.log("SUCCESSFULLY SAVED:", targetPath3);
  } catch (e) {
    console.log("Could not write targetPath3:", e.message);
  }
}

run().catch(console.error);
