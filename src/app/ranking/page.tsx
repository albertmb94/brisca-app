import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

export default async function RankingPage() {
  let rankings: any[] = [];
  let error: string | null = null;

  try {
    const supabase = await createClient();

    // Obtener todos los jugadores de partidas finalizadas
    const { data: players, error: dbError } = await supabase
      .from("game_players")
      .select("*, game:games(status, ended_at)")
      .eq("game.status", "finished");

    if (dbError) throw dbError;

    // Agregar por nombre de invitado
    const statsMap = new Map<string, { name: string; games: number; wins: number; reentries: number; totalScore: number }>();

    for (const player of players || []) {
      const name = player.guest_name;
      const existing = statsMap.get(name) || {
        name,
        games: 0,
        wins: 0,
        reentries: 0,
        totalScore: 0,
      };

      existing.games += 1;
      existing.wins += player.status === "winner" ? 1 : 0;
      existing.reentries += player.reentry_count || 0;
      existing.totalScore += player.current_score || 0;
      statsMap.set(name, existing);
    }

    rankings = Array.from(statsMap.values())
      .map((r) => ({
        ...r,
        winRate: r.games > 0 ? (r.wins / r.games) * 100 : 0,
        avgScore: r.games > 0 ? r.totalScore / r.games : 0,
      }))
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  } catch (e: any) {
    error = e.message || "Error al cargar el ranking";
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Ranking</h1>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Asegúrate de haber configurado las variables de entorno de Supabase en .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ranking de Jugadores</h1>

      {rankings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Sin datos</h3>
            <p className="text-muted-foreground">
              El ranking se generará automáticamente al finalizar partidas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Clasificación Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Jugador</th>
                    <th className="text-center py-2 px-2">Partidas</th>
                    <th className="text-center py-2 px-2">Victorias</th>
                    <th className="text-center py-2 px-2 hidden sm:table-cell">% Victoria</th>
                    <th className="text-center py-2 px-2 hidden sm:table-cell">Reenganches</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((player, index) => (
                    <tr key={player.name} className="border-b last:border-0">
                      <td className="py-3 px-2">
                        {index === 0 ? (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        ) : index === 1 ? (
                          <Medal className="h-5 w-5 text-gray-400" />
                        ) : index === 2 ? (
                          <Award className="h-5 w-5 text-amber-600" />
                        ) : (
                          <span className="text-muted-foreground font-medium">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium">{player.name}</td>
                      <td className="text-center py-3 px-2">{player.games}</td>
                      <td className="text-center py-3 px-2 font-bold text-green-600">
                        {player.wins}
                      </td>
                      <td className="text-center py-3 px-2 hidden sm:table-cell">
                        {player.winRate.toFixed(0)}%
                      </td>
                      <td className="text-center py-3 px-2 hidden sm:table-cell text-orange-600">
                        {player.reentries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
