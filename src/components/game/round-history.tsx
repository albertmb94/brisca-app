"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoundHistoryProps {
  game: any;
}

export function RoundHistory({ game }: RoundHistoryProps) {
  const [expandedRound, setExpandedRound] = useState<string | null>(null);

  if (!game.rounds || game.rounds.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de Rondas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...game.rounds].reverse().map((round: any) => {
          const isExpanded = expandedRound === round.id;
          const winner = game.players.find((p: any) => p.id === round.winner_id);

          return (
            <div
              key={round.id}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedRound(isExpanded ? null : round.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">Ronda {round.round_number}</span>
                  {winner && (
                    <span className="text-sm text-green-600">
                      Ganó: {winner.guest_name}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Jugador</th>
                        <th className="text-center py-2">Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {round.scores?.map((score: any) => (
                        <tr
                          key={score.id}
                          className={cn(
                            "border-b last:border-0",
                            score.game_player_id === round.winner_id && "bg-green-50 dark:bg-green-950"
                          )}
                        >
                          <td className="py-2">{score.game_player?.guest_name}</td>
                          <td className="text-center py-2 font-medium">{score.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
