import type {
  BitacoraState,
  Company,
  Finding,
  Meta,
  OrgNode,
  Section,
  SectionId,
  Source,
  TeamMember,
} from "./types";

export const URL_MISION =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes";
export const URL_VISION =
  "https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision";
export const URL_TRANSPARENCIA =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica";
export const URL_ORGANIGRAMA =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/estructura_org%C3%A1nica_organigrama";
export const PDF_ORGANIGRAMA =
  "https://www.acueducto.com.co/wps/wcm/connect/EAB2/5ceb5863-c366-4ed1-87c1-1f1fb76f2dcc/ORGANIGRAMA+18+DE+AGOSTO+DE+2026.pdf?MOD=AJPERES";
export const URL_PROCESOS =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mapas_cartas_descriptivas";
export const URL_GRUPOS =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial/grupos%20de%20interes";
export const URL_NIT =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/terminos_condiciones_uso";
export const URL_RSE =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial";
export const URL_FINANCIERA =
  "https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/planeacion_presupuesto_informes";

export const SECTION_ORDER: SectionId[] = [
  "empresa",
  "mision",
  "vision",
  "valores",
  "organigrama",
  "legal",
  "ambiental",
  "partes",
  "manual",
  "financieros",
  "politicas",
];

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  oficial: "Sitio / documento oficial",
  reporte: "Reporte integrado / sostenibilidad",
  norma: "Norma o ley",
  web: "Web institucional",
  otro: "Otra fuente",
};

export const ATTACHMENT_KIND_LABEL: Record<string, string> = {
  pdf: "PDF",
  word: "Word",
  texto: "Texto pegado",
  otro: "Archivo",
};

export const STATUS_LABEL: Record<string, string> = {
  pendiente: "Sin avance",
  en_progreso: "En avance",
  validado: "Listo",
};

const TODAY = "2026-08-23";

export const meta: Meta = {
  course: "ZCPVIIIA AUDITORIA DE SISTEMA",
  institution: "Corporación Universitaria Latinoamericana",
  professor: "RUIZ BOTERO WILMER",
  groupName: "8° SEMESTRE · CONTADURÍA PÚBLICA",
  city: "Barranquilla/Atlántico",
};


export const team: TeamMember[] = [
  { id: "m1", name: "BERNAL OSORIO ANDRES", role: "Auditor Líder / Coordinación y Redacción" },
  { id: "m2", name: "VIZCAINO ESCAMILLA MARIA", role: "Auditora / Identidad y Direccionamiento Institucional" },
  { id: "m3", name: "MERCADO EGUIS SHADIA", role: "Auditora / Marco Normativo, Ambiental y Evidencias" },
  { id: "m4", name: "", role: "Auditor / Arquitectura de Procesos y Sistemas de Información" },
  { id: "m5", name: "", role: "Auditor / Análisis Financiero y Control Interno" },
];

export const company: Company = {
  shortName: "EAAB",
  legalName: "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P. (EAAB-ESP)",
  nit: "899.999.094-1",
  sector: "Servicios públicos domiciliarios: acueducto y alcantarillado",
  founded: "1955",
  headquarters: "Avenida Calle 24 No. 37-15, Bogotá D.C., Colombia",
  website: "https://www.acueducto.com.co",
  nature:
    "Empresa industrial y comercial del Estado del orden distrital, prestadora de los servicios públicos de acueducto y alcantarillado en Bogotá.",
  majorityShareholder: "Distrito Capital de Bogotá.",
};

export const FILIALES: string[] = [];

export const orgChart: OrgNode = {
  id: "dueno",
  title: "Distrito Capital de Bogotá",
  subtitle: "Propietario",
  children: [
    {
      id: "junta",
      title: "Junta Directiva",
      children: [
        {
          id: "gerencia",
          title: "Gerencia General",
          subtitle: "Natasha Avendaño García",
          children: [
            { id: "sg", title: "Secretaría General" },
            { id: "jur", title: "Gerencia Jurídica" },
            { id: "plan", title: "Gerencia Corporativa Planeamiento y Control" },
            { id: "fin", title: "Gerencia Corporativa Financiera" },
            { id: "gh", title: "Gerencia Corporativa Gestión Humana y Administrativa" },
            { id: "sm", title: "Gerencia Corporativa Sistema Maestro" },
            { id: "sc", title: "Gerencia Corporativa Servicio al Cliente" },
            { id: "tec", title: "Gerencia de Tecnología" },
            { id: "amb", title: "Gerencia Corporativa Ambiental" },
            { id: "ap", title: "Gerencia Corporativa Analítica y Pérdidas" },
            { id: "ci", title: "Oficina de Control Interno y Gestión" },
          ],
        },
      ],
    },
  ],
};

export const sections: Record<SectionId, Section> = {
  empresa: {
    id: "empresa",
    title: "La empresa",
    shortTitle: "Empresa",
    prompt: "Identidad jurídica, NIT, domicilio y naturaleza de la entidad.",
    status: "validado",
    summary: "Empresa Industrial y Comercial del Estado (EICE), NIT 899.999.094-1, prestadora de acueducto y alcantarillado.",
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
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`,
    bullets: [
      "NIT 899.999.094-1 verificado en términos oficiales",
      "Empresa Industrial y Comercial del Estado (EICE) 100% pública",
      "Prestadora de acueducto y alcantarillado para más de 8 millones de habitantes",
    ],
    notes: "",
    locked: true,
  },
  mision: {
    id: "mision",
    title: "Misión",
    shortTitle: "Misión",
    prompt: "Misión oficial de la EAAB-ESP.",
    status: "validado",
    summary: "Misión oficial: gestión integral del agua para la vida y el bienestar.",
    body: `Misión Institucional Oficial:

“Somos una Empresa pública que crea valor, para la vida y el bienestar, a través de la gestión integral del agua, garantizando de forma sostenible la óptima prestación de los servicios de acueducto y alcantarillado.”

Análisis de Componentes Estratégicos:
• Creación de Valor Público: Orientación hacia la calidad de vida, salud pública y bienestar comunitario.
• Gestión Integral del Recurso: Responsabilidad en todo el ciclo hídrico, desde la cuenca hasta la disposición final.
• Sostenibilidad Operativa: Compromiso con la eficiencia técnica, resiliencia ambiental y viabilidad financiera.

Fuentes Oficiales Verificadas:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes
https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision`,
    bullets: [
      "Misión oficial literal de la EAAB-ESP",
      "Enfoque en valor público, sostenibilidad y gestión integral del agua",
    ],
    notes: "",
    locked: true,
  },
  vision: {
    id: "vision",
    title: "Visión",
    shortTitle: "Visión",
    prompt: "Visión oficial de la EAAB-ESP.",
    status: "validado",
    summary: "Visión oficial: referente de gestión pública eficiente y desarrollo sostenible.",
    body: `Visión Institucional Oficial:

“Ser referente de gestión pública eficiente y responsable, que crece e impulsa el desarrollo sostenible del territorio.”

Pilares de Proyección Estratégica:
• Liderazgo y Referente Sectorial: Benchmark de excelencia en la prestación de servicios públicos domiciliarios.
• Eficiencia y Responsabilidad: Gestión transparente, optimización de recursos y probidad administrativa.
• Impacto Territorial: Aporte al desarrollo socioeconómico regional y adaptación al cambio climático.

Fuentes Oficiales Verificadas:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes
https://www.acueducto.com.co/wps/portal/EAB2/institucionales/la-empresa/informacion-general/vision-y-mision`,
    bullets: [
      "Visión institucional literal",
      "Compromiso con la eficiencia pública y desarrollo territorial sostenible",
    ],
    notes: "",
    locked: true,
  },
  valores: {
    id: "valores",
    title: "Valores corporativos",
    shortTitle: "Valores",
    prompt: "Valores institucionales con su definición oficial.",
    status: "validado",
    summary: "Seis valores corporativos definidos oficialmente por la EAAB-ESP.",
    body: `Marco Ético y Valores Corporativos:

La entidad define formalmente seis valores fundamentales que rigen la conducta y cultura de sus colaboradores:

• Honestidad: Actuar siempre con apego a la verdad, rectitud y transparencia, anteponiendo el interés general.
• Diligencia: Desempeñar funciones con prontitud, eficiencia y cuidado para optimizar los recursos del Estado.
• Respeto: Valorar y tratar con dignidad, equidad e inclusión a todas las personas y grupos de interés.
• Compromiso: Disposición permanente para resolver las necesidades ciudadanas y generar bienestar colectivo.
• Justicia: Obrar con imparcialidad e igualdad, garantizando los derechos ciudadanos sin discriminación.
• Excelencia Técnica: Cumplir con los más altos estándares operativos, innovación y mejora continua en el servicio.

Fuente Oficial:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes`,
    bullets: [
      "Seis valores institucionales definidos formalmente",
      "Marco ético aplicable a todos los servidores y colaboradores",
    ],
    notes: "",
    locked: true,
  },
  organigrama: {
    id: "organigrama",
    title: "Organigrama",
    shortTitle: "Organigrama",
    prompt: "Estructura orgánica de la entidad.",
    status: "validado",
    summary: "Estructura orgánica oficial. Gerente General: Natasha Avendaño García.",
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
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/estructura_org%C3%A1nica_organigrama`,
    bullets: [
      "Organigrama oficial vigente de la EAAB-ESP",
      "Gerente General: Dra. Natasha Avendaño García",
      "Gerencias corporativas de primer nivel y dependencias de control",
    ],
    notes: "",
    locked: true,
  },
  legal: {
    id: "legal",
    title: "Normatividad legal",
    shortTitle: "Legal",
    prompt: "Marco jurídico aplicable a la entidad.",
    status: "validado",
    summary: "Ley 142/1994, Ley 1712/2014, Ley 1581/2012 y regulación SSPD/CRA.",
    body: `Marco Jurídico y Regulatorio Aplicable:

La entidad opera bajo un marco legal integral que garantiza la correcta prestación de servicios públicos esenciales:

• Ley 142 de 1994: Régimen de los Servicios Públicos Domiciliarios en Colombia (objeto social, tarifas y derechos de usuarios).
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752

• Ley 1712 de 2014 & Resolución MinTIC 1519 de 2020: Ley de Transparencia y Acceso a la Información Pública (publicación proactiva obligatoria de instrumentos de gestión).
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882

• Ley 1581 de 2012: Régimen General de Protección de Datos Personales (Habeas Data) en el tratamiento de información ciudadana.

• Órganos de Regulación y Vigilancia: Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA), Superintendencia de Servicios Públicos Domiciliarios (SSPD), Contraloría de Bogotá y Personería Distrital.

Portal de Transparencia y Normatividad:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`,
    bullets: [
      "Marco de servicios públicos domiciliarios (Ley 142 de 1994)",
      "Transparencia y acceso a la información (Ley 1712 de 2014)",
      "Vigilancia por SSPD, CRA y entes de control distrital",
    ],
    notes: "",
    locked: true,
  },
  ambiental: {
    id: "ambiental",
    title: "Normatividad ambiental",
    shortTitle: "Ambiental",
    prompt: "Política ambiental y marco ecológico de la EAAB.",
    status: "validado",
    summary: "Gerencia Ambiental, Ley 99/1993, Decreto 1076/2015, ISO 14001 y PIGA.",
    body: `Marco Normativo y Gestión Ambiental Institucional:

La EAAB-ESP integra la variable ecológica como eje transversal mediante su Gerencia Corporativa Ambiental y los siguientes instrumentos:

• Marco Legal Nacional: Cumplimiento de la Ley 99 de 1993 (SINA) y el Decreto Único Reglamentario 1076 de 2015 para concesión de aguas, permisos de vertimientos y licencias ambientales.
• Sistema de Gestión Ambiental (NTC-ISO 14001): Implementado en el Sistema Único de Gestión (SUG) bajo ciclo PHVA para mitigar impactos operativos.
• Plan Institucional de Gestión Ambiental (PIGA): Instrumento concertado con la Secretaría Distrital de Ambiente (SDA) y la CAR para la conservación de cuencas abastecedoras (Chingaza, Sumapaz, Tibitoc).
• Responsabilidad Hídrica: Programa "Ambientalmente sostenibles" para la protección de fuentes hídricas y el saneamiento del río Bogotá.

Fuentes Oficiales Ambientales:
https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`,
    bullets: [
      "Gerencia Corporativa Ambiental en la estructura directiva",
      "Cumplimiento de Ley 99 de 1993 y Decreto 1076 de 2015",
      "Certificación en Sistema de Gestión Ambiental NTC ISO 14001",
    ],
    notes: "",
    locked: true,
  },
  partes: {
    id: "partes",
    title: "Partes interesadas",
    shortTitle: "Partes",
    prompt: "Grupos de interés caracterizados por la entidad.",
    status: "validado",
    summary: "Caracterización de 9 grupos de valor y mecanismos de participación.",
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
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica`,
    bullets: [
      "Nueve grupos de interés caracterizados formalmente",
      "Medición periódica de satisfacción y rendición de cuentas",
    ],
    notes: "",
    locked: true,
  },
  manual: {
    id: "manual",
    title: "Manual de funciones y procedimientos",
    shortTitle: "Manual",
    prompt: "Manual de cargos, funciones y mapas de procesos.",
    status: "validado",
    summary: "Manual de cargos (Res. 0409/2026) y mapas de procesos en Transparencia.",
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
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/informacion_entidad/mision_vision_funciones_deberes`,
    bullets: [
      "Manual de cargos formalizado bajo Resolución 0409 de 2026",
      "Arquitectura de 4 macroprocesos (Estratégicos, Misionales, Apoyo y Control)",
      "Enfoque de auditoría en segregación de funciones (SoD) y perfiles TI",
    ],
    notes: "",
    locked: true,
  },
  financieros: {
    id: "financieros",
    title: "Estados financieros",
    shortTitle: "Financiero",
    prompt: "Balances y cifras financieras del período auditado.",
    status: "pendiente",
    summary: "Balances, estados de resultados y ejecución presupuestal auditados.",
    body: `Estados Financieros y Situación Presupuestal:

La información económica, financiera y presupuestal de la EAAB-ESP se reporta periódicamente conforme al marco contable público:

• Instrumentos Auditables: Estados de situación financiera (balance general), estado de resultados integrales, estado de flujo de efectivo y reportes de ejecución presupuestal de ingresos y gastos.
• Marco Normativo Contable: Resoluciones de la Contaduría General de la Nación (CGN) para empresas que cotizan o captan recursos del público y reporte a la plataforma CHIP.
• Criterio de Auditoría: Verificación de la razonabilidad de las cifras, capacidad de inversión en infraestructura de acueducto y suficiencia de provisiones para pasivos contingentes.

Fuente Oficial de Reportes:
https://www.acueducto.com.co/wps/portal/EAB2/Home/transparencia_informacion_publica/planeacion_presupuesto_informes`,
    bullets: [
      "Reportes financieros oficiales de la EAAB-ESP",
      "Auditoría con base en estados contables y presupuestales",
    ],
    notes: "",
    locked: true,
  },
  politicas: {
    id: "politicas",
    title: "Políticas y sistema de gestión",
    shortTitle: "Políticas",
    prompt: "Políticas del Sistema Único de Gestión (SUG).",
    status: "pendiente",
    summary: "Políticas integradas de calidad, ambiente, SST y ética pública.",
    body: `Políticas Institucionales y Sistema Integrado de Gestión:

Directrices estratégicas adoptadas por la entidad para garantizar la calidad del servicio, sostenibilidad y probidad administrativa:

• Sistema Único de Gestión (SUG): Integración certificada de normas técnicas de Calidad (NTC-ISO 9001), Gestión Ambiental (NTC-ISO 14001) y Seguridad y Salud en el Trabajo (NTC-ISO 45001).
• Política de Calidad y Continuidad: Compromiso con los estándares de potabilidad, presión y continuidad del servicio en la red matriz.
• Política de Seguridad de la Información: Directrices para la custodia de datos de usuarios, continuidad tecnológica y protección de activos de información.
• Política de Ética, Integridad y Anticorrupción: Lineamientos para la prevención del fraude, transparencia contractual y canal de denuncias.

Fuente Oficial:
https://www.acueducto.com.co/wps/portal/EAB2/Home/la-empresa/responsabilidad_social_empresarial`,
    bullets: [
      "Sistema Único de Gestión (SUG) con certificaciones ISO",
      "Políticas de sostenibilidad y responsabilidad social empresarial",
    ],
    notes: "",
    locked: true,
  },
};

export const sources: Source[] = [
  {
    id: "s1",
    name: "EAAB — Misión, visión, funciones y deberes (y valores)",
    url: URL_MISION,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Encabezados literales Misión, Visión y Valores corporativos. Acuerdos y manual de funciones.",
  },
  {
    id: "s2",
    name: "EAAB — Transparencia y acceso a la información pública (Ley 1712)",
    url: URL_TRANSPARENCIA,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Índice legal: entidad, organigrama, procesos, normativa, grupos de interés.",
  },
  {
    id: "s3",
    name: "Organigrama EAAB-ESP (PDF, 18 de agosto de 2026)",
    url: PDF_ORGANIGRAMA,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Gerencia General Natasha Avendaño García y gerencias de primer nivel.",
  },
  {
    id: "s4",
    name: "EAAB — Visión y misión (página institucional)",
    url: URL_VISION,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Misma misión y visión, encabezados literales.",
  },
  {
    id: "s5",
    name: "Estructura orgánica - organigrama (ficha Transparencia)",
    url: URL_ORGANIGRAMA,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Publicación 19 de agosto de 2026.",
  },
  {
    id: "s6",
    name: "EAAB — Responsabilidad social empresarial",
    url: URL_RSE,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Programa ambientalmente sostenibles y entorno ambiental.",
  },
  {
    id: "s7",
    name: "Ley 1712 de 2014 — transparencia y acceso a la información pública",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882",
    type: "norma",
    consultedAt: TODAY,
    notes: "Obliga a publicar misión, visión, funciones, organigrama y procesos.",
  },
  {
    id: "s8",
    name: "Ley 142 de 1994 — régimen de servicios públicos domiciliarios",
    url: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752",
    type: "norma",
    consultedAt: TODAY,
    notes: "Marco del objeto social de la EAAB-ESP.",
  },
  {
    id: "s9",
    name: "Términos y condiciones del sitio (NIT y domicilio)",
    url: URL_NIT,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Razón social EAAB-ESP, NIT 899.999.094, Av. Calle 24 No. 37-15.",
  },
  {
    id: "s10",
    name: "EAAB — Planeación, presupuesto e informes",
    url: URL_FINANCIERA,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Índice para estados y presupuesto. El PDF del período se sube a la bitácora.",
  },
  {
    id: "s11",
    name: "EAAB — Grupos de interés",
    url: URL_GRUPOS,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Usuarios, comunidad, servidores, proveedores, autoridad, organizaciones, medios, academia, Junta.",
  },
  {
    id: "s12",
    name: "Mapas y cartas descriptivas de los procesos",
    url: URL_PROCESOS,
    type: "oficial",
    consultedAt: TODAY,
    notes: "Procedimientos internos publicados por Ley 1712.",
  },
];

export const SECTION_SOURCES: Partial<Record<string, string[]>> = {
  empresa: ["s9", "s2", "s1"],
  mision: ["s1", "s4"],
  vision: ["s1", "s4"],
  valores: ["s1", "s4"],
  organigrama: ["s3", "s5", "s1"],
  legal: ["s8", "s7", "s2"],
  ambiental: ["s6", "s5"],
  partes: ["s11", "s2"],
  manual: ["s1", "s12", "s3"],
  financieros: ["s10", "s2"],
  politicas: ["s6", "s1"],
};

export function sourcesForSection(id: SectionId, all: Source[]) {
  return (SECTION_SOURCES[id] ?? [])
    .map((sid) => all.find((s) => s.id === sid))
    .filter((s): s is Source => Boolean(s));
}

export const findings: Finding[] = [
  {
    id: "f1",
    date: TODAY,
    createdAt: `${TODAY}T14:10:00`,
    author: "Equipo",
    sectionId: "empresa",
    title: "Identidad jurídica y NIT confirmados",
    content:
      "Empresa de Acueducto y Alcantarillado de Bogotá E.S.P., NIT 899.999.094-1, Av. Calle 24 No. 37-15, Bogotá.",
    sourceName: "Términos y condiciones EAAB",
    sourceUrl: URL_NIT,
    sourceType: "oficial",
  },
  {
    id: "f2",
    date: TODAY,
    createdAt: `${TODAY}T14:20:00`,
    author: "Equipo",
    sectionId: "mision",
    title: "Misión oficial, encabezado literal",
    content:
      "“Somos una Empresa pública que crea valor, para la vida y el bienestar, a través de la gestión integral del agua, garantizando de forma sostenible la óptima prestación de los servicios de acueducto y alcantarillado.”",
    sourceName: "Misión, visión, funciones y deberes EAAB",
    sourceUrl: URL_MISION,
    sourceType: "oficial",
  },
  {
    id: "f3",
    date: TODAY,
    createdAt: `${TODAY}T14:30:00`,
    author: "Equipo",
    sectionId: "vision",
    title: "Visión oficial, encabezado literal",
    content:
      "“Ser referente de gestión pública eficiente y responsable, que crece e impulsa el desarrollo sostenible del territorio.”",
    sourceName: "Visión y misión EAAB",
    sourceUrl: URL_VISION,
    sourceType: "oficial",
  },
  {
    id: "f4",
    date: TODAY,
    createdAt: `${TODAY}T14:40:00`,
    author: "Equipo",
    sectionId: "valores",
    title: "Seis valores corporativos con definición",
    content:
      "Honestidad, diligencia, respeto, compromiso, justicia y excelencia técnica. Publicados en la misma ficha que misión y visión.",
    sourceName: "Misión, visión, funciones y deberes EAAB",
    sourceUrl: URL_MISION,
    sourceType: "oficial",
  },
  {
    id: "f5",
    date: TODAY,
    createdAt: `${TODAY}T14:55:00`,
    author: "Equipo",
    sectionId: "organigrama",
    title: "Organigrama PDF 18 de agosto de 2026",
    content:
      "Gerente General Natasha Avendaño García. Gerencias de primer nivel: Secretaría General, Jurídica, Planeamiento, Financiera, Gestión Humana, Sistema Maestro, Servicio al Cliente, Tecnología, Ambiental, Analítica y Pérdidas, control interno.",
    sourceName: "Organigrama EAAB-ESP 18 de agosto de 2026",
    sourceUrl: PDF_ORGANIGRAMA,
    sourceType: "oficial",
  },
  {
    id: "f6",
    date: TODAY,
    createdAt: `${TODAY}T15:10:00`,
    author: "Equipo",
    sectionId: "legal",
    title: "Ley 142 y Ley 1712",
    content:
      "EICE distrital prestadora de acueducto y alcantarillado. CRA y SSPD. El portal de Transparencia es la evidencia de la Ley 1712.",
    sourceName: "Ley 142 de 1994",
    sourceUrl: "https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=2752",
    sourceType: "norma",
  },
  {
    id: "f7",
    date: TODAY,
    createdAt: `${TODAY}T15:25:00`,
    author: "Equipo",
    sectionId: "ambiental",
    title: "Gerencia Ambiental y marco Ley 99 / ISO 14001",
    content:
      "Gerencia Corporativa Ambiental en el organigrama. PIGA y Sistema Único de Gestión con NTC ISO 14001. Ley 99 de 1993 y Decreto 1076 de 2015.",
    sourceName: "Responsabilidad social empresarial EAAB",
    sourceUrl: URL_RSE,
    sourceType: "oficial",
  },
  {
    id: "f8",
    date: TODAY,
    createdAt: `${TODAY}T15:40:00`,
    author: "Equipo",
    sectionId: "partes",
    title: "Nueve grupos de interés caracterizados",
    content:
      "Usuarios, comunidad, servidores, proveedores, autoridad, organizaciones, medios, academia e investigación, Junta Directiva.",
    sourceName: "Grupos de interés EAAB",
    sourceUrl: URL_GRUPOS,
    sourceType: "oficial",
  },
  {
    id: "f9",
    date: TODAY,
    createdAt: `${TODAY}T15:55:00`,
    author: "Equipo",
    sectionId: "manual",
    title: "Manual de funciones y mapas de proceso publicados",
    content:
      "Resoluciones de manual de cargos de trabajadores oficiales (0409 de 2026) y mapas de procesos en Transparencia.",
    sourceName: "Misión, visión, funciones y deberes EAAB",
    sourceUrl: URL_MISION,
    sourceType: "oficial",
  },
];

export function createInitialState(): BitacoraState {
  const lockedSections = Object.fromEntries(
    Object.entries(sections).map(([id, section]) => [id, { ...section, locked: true }]),
  ) as Record<SectionId, Section>;
  return {
    hydrated: true,
    dirty: false,
    lastExportAt: null,
    meta,
    team,
    company,
    sections: lockedSections,
    sectionOrder: [...SECTION_ORDER],
    findings,
    sources,
    orgChart,
    attachments: [],
    lastDownload: null,
  };
}
