import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGame } from "@/lib/actions/game-actions";
import { startGame } from "@/lib/actions/game-actions";
import { GameScoreboard } from "@/components/game/scoreboard";
import { RoundForm } from "@/components/game/round-form";
import { PaymentSummary } from "@/components/game/payment-summary";
import { RoundHistory } from "@/components/game/round-history";

function statusLabel(status: string) {
  switch (status) {
    case "waiting": return "En espera";
    case "in_progress": return "En juego";
    case "finished": return "Finalizada";
    default: return status;
  }
}

export default async function PartidaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Partida no encontrada</h1>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const isWaiting = game.status === "waiting";
  const isInProgress = game.status === "in_progress";
  const isFinished = game.status === "finished";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{game.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isInProgress ? "default" : isFinished ? "outline" : "secondary"}>
                {statusLabel(game.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {game.players.length} jugadores · Objetivo: {game.target_score} pts
              </span>
            </div>
          </div>
        </div>

        {isWaiting && (
          <form action={startGame.bind(null, game.id)}>
            <Button type="submit">
              <Play className="mr-2 h-4 w-4" />
              Iniciar Partida
            </Button>
          </form>
        )}
      </div>

      {/* Scoreboard */}
      <GameScoreboard game={game} />

      {/* Formulario de ronda (solo en progreso) */}
      {isInProgress && (
        <RoundForm game={game} />
      )}

      {/* Historial de rondas */}
      {game.rounds.length > 0 && (
        <RoundHistory game={game} />
      )}

      {/* Resumen de pagos (solo finalizada) */}
      {isFinished && (
        <PaymentSummary game={game} />
      )}

      {/* Info de precios */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Configuración de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Por ronda:</span>{" "}
              <span className="font-medium">{game.price_per_round}€</span>
            </div>
            <div>
              <span className="text-muted-foreground">Por partida:</span>{" "}
              <span className="font-medium">{game.price_per_game}€</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reenganche:</span>{" "}
              <span className="font-medium">{game.price_per_reentry}€</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
