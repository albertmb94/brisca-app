"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteGame } from "@/lib/actions/game-actions";

function isRedirectError(error: any): boolean {
  return error?.message?.includes("NEXT_REDIRECT") || error?.digest?.includes("NEXT_REDIRECT");
}

interface CancelGameButtonProps {
  gameId: string;
  variant?: "icon" | "button";
}

export function CancelGameButton({ gameId, variant = "button" }: CancelGameButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGame(gameId);
    } catch (error: any) {
      if (isRedirectError(error)) {
        return;
      }
      alert("Error al cancelar: " + (error?.message || "Error desconocido"));
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" variant="ghost" className="text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar partida</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres cancelar y eliminar esta partida? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            No, volver
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Sí, cancelar partida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
