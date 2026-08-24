# Bitácora EAAB

Cuaderno de investigación empresarial sobre la **Empresa de Acueducto y Alcantarillado de Bogotá E.S.P.** El Word se regenera desde las secciones, hallazgos y anexos.

## Abrir en Google Antigravity

1. Descarguen el ZIP y descomprímanlo en una carpeta (por ejemplo `Documentos/bitacora-eaab`).
2. En Antigravity: **Select Project → New Project → Add Folder** y elijan esa carpeta.
3. En el chat del agente, peguen el recuadro de abajo.
4. Cuando pida correr comandos, acepten `npm install` y `npm run dev`.

```
Este proyecto es una bitácora de investigación (TanStack Start + React) de la EAAB-ESP.

Primero: npm install
Después: npm run dev

La empresa, misión, visión, valores, organigrama y fuentes están en src/lib/seed.ts.
El Word se arma en src/lib/export-docx.ts y se sirve en /api/word.

No cambies la empresa ni inventes cifras. Si te pido buscar una política o un estado financiero, búscala en acueducto.com.co o .gov.co, valida el enlace y añádela a la sección con la URL.
```

## En el PC (sin Antigravity)

Hace falta Node 20 o 22.

```bash
npm install
npm run dev
```

Luego abren la URL que imprima Vite (suele ser el puerto 8080). **Descargar Word** guarda `Bitacora_EAAB.docx`.

## Dónde está cada cosa

| Qué | Archivo |
| --- | --- |
| Empresa, misión, visión, fuentes | `src/lib/seed.ts` |
| Word | `src/lib/export-docx.ts` |
| Subir PDF / pegar texto | `src/components/evidence-panel.tsx` |
| Buscar y validar URLs | `src/routes/api/investigate.ts` |

Estados financieros y políticas van vacíos a propósito: se llena subiendo el PDF del período.
