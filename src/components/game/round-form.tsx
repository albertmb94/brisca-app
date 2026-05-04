"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addRound } from "@/lib/actions/game-actions";

function isRedirectError(error: any): boolean {
  return error?.message?.includes("NEXT_REDIRECT") || error?.digest?.includes("NEXT_REDIRECT");
}

interface RoundFormProps {
  game: any;
}

export function RoundForm({ game }: RoundFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activePlayers = game.players.filter((p: any) => p.status === "active");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addRound(formData);
    } catch (error: any) {
      if (isRedirectError(error)) {
        return;
      }
      alert("Error al registrar ronda: " + (error?.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activePlayers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Ronda {game.rounds.length + 1}</CardTitle>
        <CardDescription>
          Introduce los puntos de cada jugador en esta ronda. Gana quien menos puntos obtenga.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="gameId" value={game.id} />

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activePlayers.map((player: any) => (
              <div key={player.id}>
                <input type="hidden" name="playerId" value={player.id} />
                <div className="space-y-2">
                  <Label htmlFor={`points-${player.id}`}>{player.guest_name}</Label>
                  <Input
                    id={`points-${player.id}`}
                    name="points"
                    type="number"
                    min={0}
                    defaultValue={0}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Guardando..." : "Registrar Ronda"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
