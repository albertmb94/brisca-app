import Link from "next/link";
import { PlusCircle, Play, Trophy, Clock, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGames } from "@/lib/actions/game-actions";
import { DeleteGameButton } from "@/components/game/delete-game-button";

function statusBadge(status: string) {
  switch (status) {
    case "waiting":
      return <Badge variant="secondary">En espera</Badge>;
    case "in_progress":
      return <Badge variant="default" className="bg-green-600">En juego</Badge>;
    case "finished":
      return <Badge variant="outline">Finalizada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function HomePage() {
  let games: any[] = [];
  let error: string | null = null;

  try {
    games = await getGames();
  } catch (e: any) {
    console.error("[HomePage] Error cargando partidas:", e);
    error = e.message || "Error al conectar con la base de datos";
  }

  const activeGames = games.filter((g: any) => g.status !== "finished");
  const finishedGames = games.filter((g: any) => g.status === "finished");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BriscaApp</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus partidas de brisca, puntuaciones y pagos.
          </p>
        </div>
        <Link href="/nueva-partida">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Partida
          </Button>
        </Link>
      </div>

      {/* Error de conexión */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Error de conexión</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Verifica que las variables de entorno de Supabase estén configuradas correctamente en Vercel.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partidas Activas</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGames.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partidas Jugadas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedGames.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partidas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{games.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Partidas activas */}
      {activeGames.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Partidas Activas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGames.map((game: any) => (
              <Card key={game.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{game.name}</CardTitle>
                    {statusBadge(game.status)}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {game.players?.length || 0} jugadores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Objetivo: {game.target_score} pts
                    </div>
                    <div className="flex gap-2 items-center">
                      <DeleteGameButton gameId={game.id} />
                      <Link href={`/partidas/${game.id}`}>
                        <Button size="sm">Ver partida</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Partidas finalizadas recientes */}
      {finishedGames.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Partidas Finalizadas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {finishedGames.slice(0, 6).map((game: any) => (
              <Card key={game.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{game.name}</CardTitle>
                    {statusBadge(game.status)}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {game.players?.length || 0} jugadores
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Objetivo: {game.target_score} pts
                    </div>
                    <Link href={`/partidas/${game.id}`}>
                      <Button size="sm" variant="outline">Ver resumen</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {games.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay partidas</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera partida para empezar.</p>
            <Link href="/nueva-partida">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Partida
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
