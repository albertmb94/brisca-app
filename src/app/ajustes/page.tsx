"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Save, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";

export default function AjustesPage() {
  const router = useRouter();
  const settings = useSettings();

  const [pricePerRound, setPricePerRound] = useState(settings.defaultPricePerRound);
  const [pricePerGame, setPricePerGame] = useState(settings.defaultPricePerGame);
  const [pricePerReentry, setPricePerReentry] = useState(settings.defaultPricePerReentry);
  const [targetScore, setTargetScore] = useState(settings.defaultTargetScore);
  const [playerNames, setPlayerNames] = useState<string[]>(settings.defaultPlayerNames.length > 0 ? settings.defaultPlayerNames : [""]);

  const handleSave = () => {
    settings.setDefaults({
      defaultPricePerRound: pricePerRound,
      defaultPricePerGame: pricePerGame,
      defaultPricePerReentry: pricePerReentry,
      defaultTargetScore: targetScore,
      defaultPlayerNames: playerNames.filter((n) => n.trim() !== ""),
    });
    alert("Ajustes guardados correctamente");
  };

  const handleReset = () => {
    settings.resetDefaults();
    setPricePerRound(0);
    setPricePerGame(0);
    setPricePerReentry(0);
    setTargetScore(150);
    setPlayerNames([""]);
    alert("Ajustes restablecidos");
  };

  const addPlayerName = () => setPlayerNames([...playerNames, ""]);
  const removePlayerName = (index: number) => {
    const next = playerNames.filter((_, i) => i !== index);
    setPlayerNames(next.length > 0 ? next : [""]);
  };
  const updatePlayerName = (index: number, value: string) => {
    const next = [...playerNames];
    next[index] = value;
    setPlayerNames(next);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Valores por defecto de partidas
          </CardTitle>
          <CardDescription>
            Se rellenarán automáticamente al crear una nueva partida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Puntos objetivo</Label>
              <Input
                id="targetScore"
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || 150)}
                min={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerRound">€ por ronda</Label>
              <Input
                id="pricePerRound"
                type="number"
                step="0.01"
                value={pricePerRound}
                onChange={(e) => setPricePerRound(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerGame">€ por partida</Label>
              <Input
                id="pricePerGame"
                type="number"
                step="0.01"
                value={pricePerGame}
                onChange={(e) => setPricePerGame(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerReentry">€ reenganche</Label>
              <Input
                id="pricePerReentry"
                type="number"
                step="0.01"
                value={pricePerReentry}
                onChange={(e) => setPricePerReentry(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jugadores por defecto</CardTitle>
          <CardDescription>
            Nombres que aparecerán pre-rellenados al crear una partida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`default-player-${i}`}>Jugador {i + 1}</Label>
                <Input
                  id={`default-player-${i}`}
                  value={name}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  placeholder={`Nombre del jugador ${i + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePlayerName(i)}
                disabled={playerNames.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addPlayerName}>
            <Plus className="mr-1 h-4 w-4" />
            Añadir jugador
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restablecer
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Guardar ajustes
        </Button>
      </div>
    </div>
  );
}
