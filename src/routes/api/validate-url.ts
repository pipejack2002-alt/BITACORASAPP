import { createFileRoute } from "@tanstack/react-router";
import { probeUrl } from "@/lib/probe-url";

export const Route = createFileRoute("/api/validate-url")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { url?: string; urls?: string[] } | null;
        const urls = body?.urls?.length ? body.urls : body?.url ? [body.url] : [];
        if (urls.length === 0) return Response.json({ error: "missing url" }, { status: 400 });
        if (urls.length === 1) return Response.json(await probeUrl(urls[0]));
        const checks = await Promise.all(urls.slice(0, 20).map((u) => probeUrl(u)));
        return Response.json({ checks });
      },
    },
  },
});
