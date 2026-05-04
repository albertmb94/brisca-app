import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HistorialPage() {
  let games: any[] = [];
  let error: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error: dbError } = await supabase
      .from("games")
      .select("*, players:game_players(*)")
      .eq("status", "finished")
      .order("ended_at", { ascending: false });

    if (dbError) throw dbError;
    games = data || [];
  } catch (e: any) {
    error = e.message || "Error al cargar el historial";
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Historial</h1>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Asegúrate de haber configurado las variables de entorno de Supabase en .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historial de Partidas</h1>

      {games.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Sin partidas finalizadas</h3>
            <p className="text-muted-foreground mb-4">
              Las partidas finalizadas aparecerán aquí.
            </p>
            <Link href="/nueva-partida">
              <Button>Crear Partida</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {games.map((game) => {
            const winner = game.players?.find((p: any) => p.status === "winner");
            return (
              <Link key={game.id} href={`/partidas/${game.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <Badge variant="outline">Finalizada</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {game.players?.length || 0} jugadores
                    </div>
                    {winner && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          Ganador: {winner.guest_name}
                        </span>
                        <span className="text-muted-foreground">
                          ({winner.current_score} pts)
                        </span>
                      </div>
                    )}
                    {game.ended_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(game.ended_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
