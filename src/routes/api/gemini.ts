import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/gemini")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => null)) as {
            prompt?: string;
            context?: string;
            sectionTitle?: string;
            model?: string;
            apiKey?: string;
            company?: {
              shortName?: string;
              legalName?: string;
              sector?: string;
              nature?: string;
              website?: string;
              nit?: string;
              headquarters?: string;
            };
            companyName?: string;
          } | null;

          const prompt = body?.prompt?.trim();
          if (!prompt) {
            return Response.json({ error: "Falta el prompt o consulta para Gemini." }, { status: 400 });
          }

          const apiKey =
            body?.apiKey?.trim() ||
            process.env.GEMINI_API_KEY ||
            process.env.VITE_GEMINI_API_KEY ||
            "";

          if (!apiKey) {
            return Response.json(
              {
                error:
                  "No se encontró una clave de API de Gemini. Ingresa tu API Key en la barra de configuración de Gemini.",
                requiresKey: true,
              },
              { status: 401 },
            );
          }

          const selectedModel = body?.model?.trim() || "gemini-3.6-flash";
          const company = body?.company;
          const compName =
            company?.legalName || company?.shortName || body?.companyName || "la entidad auditada";
          const compSector = company?.sector || "empresarial / institucional";
          const compNature = company?.nature || "pública, privada o mixta";

          const systemPrompt = `Eres un Asistente Senior de Investigación Empresarial y Auditoría de Sistemas para estudiantes universitarios de Contaduría Pública e Ingeniería de Sistemas.
Actualmente estás auditando a la empresa: "${compName}" (Sector: ${compSector}, Naturaleza: ${compNature}).
Tu misión es asistir al equipo universitario en la investigación rigurosa, redacción académica de alto nivel, estructuración de hallazgos y análisis documental para su bitácora y reporte Word (.docx) bajo Norma APA 7ª edición.
Reglas estrictas:
1. Sé preciso, profesional, analítico y académicamente riguroso.
2. Fundamenta tus respuestas en el marco normativo colombiano e internacional aplicable (ej. Ley 43 de 1990 de auditoría, Ley 1712 de 2014 si aplica transparencia pública, Ley 1581 de 2012 de datos personales, Ley 222 de 1995 de sociedades, estándares ISO/IEC 27001, ISO 9001, COSO, COBIT y normas sectoriales).
3. Estructura las respuestas con títulos ejecutivos, párrafos analíticos y viñetas claras cuando sea pertinente.
4. Si se te proporciona texto de extractos de balances, manuales o PDFs, analiza y sintetiza las cifras, roles y hallazgos clave.`;

          const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

          let fullUserMessage = "";
          if (body?.sectionTitle) {
            fullUserMessage += `[Sección de trabajo: ${body.sectionTitle}]\n\n`;
          }
          if (body?.context) {
            fullUserMessage += `[Contexto / Texto de evidencia analizado]:\n${body.context}\n\n`;
          }
          fullUserMessage += `[Instrucción / Pregunta]:\n${prompt}`;

          contents.push({
            role: "user",
            parts: [{ text: fullUserMessage }],
          });

          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents,
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
              },
            }),
            signal: AbortSignal.timeout(30000),
          });

          const data = await res.json();

          if (!res.ok) {
            const apiError = data?.error?.message || "Error al comunicarse con la API de Gemini.";
            if (res.status === 400 || res.status === 403 || res.status === 401) {
              return Response.json(
                { error: `Error de Google Gemini (${res.status}): ${apiError}. Verifica tu API Key.` },
                { status: res.status },
              );
            }
            return Response.json({ error: apiError }, { status: res.status });
          }

          const candidate = data?.candidates?.[0];
          const text = candidate?.content?.parts?.map((p: { text: string }) => p.text).join("\n") || "";

          if (!text) {
            return Response.json({ error: "Gemini no devolvió ninguna respuesta de texto." }, { status: 500 });
          }

          return Response.json({
            text,
            model: selectedModel,
            finishReason: candidate?.finishReason || "STOP",
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error interno al invocar Gemini";
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
