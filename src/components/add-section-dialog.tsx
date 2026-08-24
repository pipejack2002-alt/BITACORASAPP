import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBitacora } from "@/lib/store";

export function AddSectionDialog({
  size = "sm",
  label = "Nueva sección",
}: {
  size?: "sm" | "default";
  label?: string;
}) {
  const addSection = useBitacora((s) => s.addSection);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const id = addSection(title);
    setTitle("");
    setOpen(false);
    void navigate({ to: "/seccion/$id", params: { id } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant="secondary">
          <Plus className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent title="Nueva sección">
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-sm leading-relaxed text-ink-soft">
            Pónganle el nombre que pidió el encargo: estado financiero, política de calidad,
            ISO, lo que salga. Luego suben el PDF o el avance. Si cambia el tema, se
            renombra.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-sec">Nombre</Label>
            <Input
              id="new-sec"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Estado financiero 2025"
              autoFocus
            />
          </div>
          <Button type="submit">Crear y abrir</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
