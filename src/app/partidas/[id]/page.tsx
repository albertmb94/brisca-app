export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  let game: any = null;
  let error: string | null = null;

  try {
    game = await getGame(id);
  } catch (e: any) {
    console.error("[PartidaPage] Error cargando partida:", e);
    error = e.message || "Error al cargar la partida";
  }

  if (error || !game) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 py-6">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Error al cargar la partida</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error || "La partida no existe o no se pudo conectar con la base de datos."}
              </p>
            </div>
          </CardContent>
        </Card>
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

      <GameScoreboard game={game} />

      {isInProgress && <RoundForm game={game} />}

      {game.rounds.length > 0 && <RoundHistory game={game} />}

      {isFinished && <PaymentSummary game={game} />}

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
