"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGame } from "@/lib/actions/game-actions";

export default function NuevaPartidaPage() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createGame(formData);
    } catch (error) {
      alert("Error al crear la partida: " + (error as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nueva Partida</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Define las reglas y precios de la partida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la partida</Label>
              <Input id="name" name="name" placeholder="Ej: Partida del sábado" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Máx. jugadores</Label>
                <Input id="maxPlayers" name="maxPlayers" type="number" defaultValue={8} min={2} max={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetScore">Puntos objetivo</Label>
                <Input id="targetScore" name="targetScore" type="number" defaultValue={150} min={50} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerRound">€ por ronda</Label>
                <Input id="pricePerRound" name="pricePerRound" type="number" step="0.01" defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerGame">€ por partida</Label>
                <Input id="pricePerGame" name="pricePerGame" type="number" step="0.01" defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerReentry">€ reenganche</Label>
                <Input id="pricePerReentry" name="pricePerReentry" type="number" step="0.01" defaultValue={0} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jugadores</CardTitle>
            <CardDescription>Añade los nombres de los jugadores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Label htmlFor={`player-${i}`}>Jugador {i + 1}</Label>
                <Input
                  id={`player-${i}`}
                  name="playerNames"
                  placeholder={`Nombre del jugador ${i + 1}`}
                  required={i < 2}
                />
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPlayerCount((c) => Math.max(2, c - 1))}
                disabled={playerCount <= 2}
              >
                <Minus className="mr-1 h-4 w-4" />
                Quitar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPlayerCount((c) => Math.min(8, c + 1))}
                disabled={playerCount >= 8}
              >
                <Plus className="mr-1 h-4 w-4" />
                Añadir
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Partida"}
          </Button>
        </div>
      </form>
    </div>
  );
}
