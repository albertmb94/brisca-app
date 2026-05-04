"use client";

import { Trophy, Skull, RotateCcw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameScoreboardProps {
  game: any;
}

export function GameScoreboard({ game }: GameScoreboardProps) {
  const players = game.players || [];
  const targetScore = game.target_score;

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.status === "winner") return -1;
    if (b.status === "winner") return 1;
    if (a.status === "eliminated" && b.status !== "eliminated") return 1;
    if (b.status === "eliminated" && a.status !== "eliminated") return -1;
    return a.current_score - b.current_score;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Marcador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedPlayers.map((player: any) => {
          const isOverTarget = player.current_score > targetScore;
          const isWinner = player.status === "winner";
          const isEliminated = player.status === "eliminated";
          const isReentered = player.reentry_count > 0;
          const progress = Math.min((player.current_score / targetScore) * 100, 100);
          const isDanger = progress >= 80 && !isEliminated && !isWinner;

          return (
            <div
              key={player.id}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                isWinner && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                isEliminated && "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 opacity-70",
                isDanger && !isOverTarget && "border-orange-200 dark:border-orange-800",
                !isWinner && !isEliminated && !isDanger && "hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                  {isEliminated && <Skull className="h-4 w-4 text-red-500" />}
                  {isReentered && !isEliminated && !isWinner && (
                    <RotateCcw className="h-4 w-4 text-orange-500" />
                  )}
                  {isDanger && !isReentered && !isOverTarget && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="font-semibold">{player.guest_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {player.reentry_count > 0 && (
                    <span className="text-xs text-orange-600 font-medium">
                      {player.reentry_count} reeng.
                    </span>
                  )}
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isWinner && "text-green-700 dark:text-green-300",
                      isEliminated && "text-red-600",
                      isOverTarget && !isEliminated && !isWinner && "text-orange-600"
                    )}
                  >
                    {player.current_score}
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      /{targetScore}
                    </span>
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    isWinner && "bg-green-500",
                    isEliminated && "bg-red-500",
                    isDanger && "bg-orange-500",
                    !isWinner && !isEliminated && !isDanger && "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                <span>{player.total_rounds_won} rondas ganadas</span>
                <span>
                  {isWinner
                    ? "Ganador"
                    : isEliminated
                    ? "Eliminado"
                    : isDanger
                    ? "¡Cuidado!"
                    : "Activo"}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
