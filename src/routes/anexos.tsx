import { createFileRoute } from "@tanstack/react-router";
import { EvidencePanel } from "@/components/evidence-panel";
import { InvestigatePanel } from "@/components/investigate-panel";

export const Route = createFileRoute("/anexos")({ component: AnexosPage });

function AnexosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="font-display text-3xl text-ink">Anexos de auditoría</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
          Estados financieros, políticas del SIG, actas. Suban PDF o Word, o peguen el
          párrafo. El extracto vive aquí y se reconstruye en el documento Word.
        </p>
      </div>
      <InvestigatePanel />
      <EvidencePanel />
    </div>
  );
}