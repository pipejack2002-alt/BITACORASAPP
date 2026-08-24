import { useState } from "react";
import { Download, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportWord } from "@/lib/use-export";

export function DownloadWordButton({
  size = "default",
  variant = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "ghost";
  className?: string;
}) {
  const { busy, exportWord } = useExportWord();

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      disabled={busy}
      onClick={() => void exportWord()}
    >
      {busy ? (
        <>
          <RefreshCw className="size-4 animate-spin" />
          Generando Word…
        </>
      ) : (
        <>
          <Download className="size-4" />
          Descargar Word (.docx)
        </>
      )}
    </Button>
  );
}

// Backward compatibility alias if needed
export function DownloadWordButtons({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  return <DownloadWordButton size={size} />;
}

export function DownloadWordBanner() {
  return null;
}
