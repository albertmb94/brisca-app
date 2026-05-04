"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Crear una nueva partida
export async function createGame(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const maxPlayers = parseInt(formData.get("maxPlayers") as string) || 8;
  const targetScore = parseInt(formData.get("targetScore") as string) || 150;
  const pricePerRound = parseFloat(formData.get("pricePerRound") as string) || 0;
  const pricePerGame = parseFloat(formData.get("pricePerGame") as string) || 0;
  const pricePerReentry = parseFloat(formData.get("pricePerReentry") as string) || 0;
  const playerNames = formData.getAll("playerNames") as string[];

  // Crear partida
  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      name,
      max_players: maxPlayers,
      target_score: targetScore,
      price_per_round: pricePerRound,
      price_per_game: pricePerGame,
      price_per_reentry: pricePerReentry,
      status: "waiting",
    })
    .select()
    .single();

  if (gameError || !game) {
    throw new Error("Error al crear la partida: " + gameError?.message);
  }

  // Crear jugadores (invitados solo con nombre)
  const players = playerNames
    .filter((n) => n.trim() !== "")
    .map((name, index) => ({
      game_id: game.id,
      guest_name: name.trim(),
      position: index + 1,
    }));

  if (players.length === 0) {
    await supabase.from("games").delete().eq("id", game.id);
    throw new Error("Debes añadir al menos un jugador");
  }

  const { error: playersError } = await supabase
    .from("game_players")
    .insert(players);

  if (playersError) {
    await supabase.from("games").delete().eq("id", game.id);
    throw new Error("Error al añadir jugadores: " + playersError.message);
  }

  revalidatePath("/");
  redirect(`/partidas/${game.id}`);
}

// Obtener listado de partidas
export async function getGames() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("games")
      .select("*, players:game_players(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getGames error]", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    console.error("[getGames exception]", error);
    return [];
  }
}

// Obtener una partida completa
export async function getGame(id: string) {
  try {
    const supabase = await createClient();

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", id)
      .single();

    if (gameError || !game) return null;

    const { data: players } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", id)
      .order("position");

    const { data: rounds } = await supabase
      .from("rounds")
      .select("*, scores:round_scores(*, game_player:game_players(*))")
      .eq("game_id", id)
      .order("round_number", { ascending: true });

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("game_id", id)
      .order("created_at", { ascending: true });

    return {
      ...game,
      players: players || [],
      rounds: rounds || [],
      transactions: transactions || [],
    };
  } catch (error: any) {
    console.error("[getGame exception]", error);
    return null;
  }
}

// Iniciar partida
export async function startGame(gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("games")
    .update({ status: "in_progress" })
    .eq("id", gameId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partidas/${gameId}`);
}

// Añadir una ronda y procesar reenganches
export async function addRound(formData: FormData) {
  const supabase = await createClient();
  const gameId = formData.get("gameId") as string;
  const playerIds = formData.getAll("playerId") as string[];
  const points = formData.getAll("points") as string[];

  if (!gameId) {
    throw new Error("ID de partida no proporcionado");
  }

  if (playerIds.length !== points.length) {
    throw new Error("Datos de ronda inválidos");
  }

  // Obtener game para precios y target
  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (!game) {
    throw new Error("Partida no encontrada. Es posible que haya sido eliminada.");
  }

  // Calcular ganador de la ronda (menor puntuación)
  const roundPoints = playerIds.map((pid, i) => ({
    playerId: pid,
    points: parseInt(points[i]) || 0,
  }));

  const winner = roundPoints.reduce((min, curr) =>
    curr.points < min.points ? curr : min
  );

  // Obtener número de ronda
  const { count: roundCount } = await supabase
    .from("rounds")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  const roundNumber = (roundCount || 0) + 1;

  // Crear ronda
  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({
      game_id: gameId,
      round_number: roundNumber,
      winner_id: winner.playerId,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (roundError || !round) {
    throw new Error("Error al crear ronda: " + roundError?.message);
  }

  // Guardar puntuaciones de ronda
  const scores = roundPoints.map((rp) => ({
    round_id: round.id,
    game_player_id: rp.playerId,
    points: rp.points,
  }));

  await supabase.from("round_scores").insert(scores);

  // Actualizar puntuaciones acumuladas y rondas ganadas
  for (const rp of roundPoints) {
    const { data: player } = await supabase
      .from("game_players")
      .select("current_score, total_rounds_won")
      .eq("id", rp.playerId)
      .single();

    if (player) {
      await supabase
        .from("game_players")
        .update({
          current_score: player.current_score + rp.points,
          total_rounds_won:
            rp.playerId === winner.playerId
              ? player.total_rounds_won + 1
              : player.total_rounds_won,
        })
        .eq("id", rp.playerId);
    }
  }

  // Crear transacciones de pago por ronda (todos los NO ganadores pagan al ganador)
  const losers = roundPoints.filter((rp) => rp.playerId !== winner.playerId);
  for (const loser of losers) {
    await supabase.from("transactions").insert({
      game_id: gameId,
      game_player_id: loser.playerId,
      recipient_id: winner.playerId,
      type: "round_payment",
      amount: game.price_per_round,
      round_number: roundNumber,
    });
  }

  // Procesar reenganches
  const { data: allPlayers } = await supabase
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("status", "active");

  const targetScore = game.target_score;
  const alivePlayers =
    allPlayers?.filter((p) => p.current_score <= targetScore) || [];
  const overTarget =
    allPlayers?.filter((p) => p.current_score > targetScore) || [];

  for (const player of overTarget) {
    if (alivePlayers.length >= 2) {
      const maxAliveScore = Math.max(...alivePlayers.map((p) => p.current_score));

      await supabase
        .from("game_players")
        .update({
          current_score: maxAliveScore,
          reentry_count: player.reentry_count + 1,
        })
        .eq("id", player.id);

      // NOTA: El pago del reenganche NO se crea aquí.
      // Solo se paga al final de la partida, acumulado: reentry_count × price_per_reentry
    } else {
      await supabase
        .from("game_players")
        .update({ status: "eliminated" })
        .eq("id", player.id);
    }
  }

  // Verificar victoria: <= 1 jugador vivo
  const { data: finalPlayers } = await supabase
    .from("game_players")
    .select("*")
    .eq("game_id", gameId)
    .eq("status", "active");

  const finalAlive =
    finalPlayers?.filter((p) => p.current_score <= targetScore) || [];

  if (finalAlive.length <= 1 && finalAlive.length > 0) {
    const winnerPlayer = finalAlive[0];

    await supabase
      .from("game_players")
      .update({ status: "winner" })
      .eq("id", winnerPlayer.id);

    await supabase
      .from("games")
      .update({ status: "finished", ended_at: new Date().toISOString(), winner_id: winnerPlayer.id })
      .eq("id", gameId);

    const { data: allGamePlayersData } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", gameId);

    const allGamePlayers = allGamePlayersData || [];

    for (const player of allGamePlayers) {
      if (player.id !== winnerPlayer.id) {
        await supabase.from("transactions").insert({
          game_id: gameId,
          game_player_id: player.id,
          recipient_id: winnerPlayer.id,
          type: "game_payment",
          amount: game.price_per_game,
        });

        if (player.reentry_count > 0) {
          await supabase.from("transactions").insert({
            game_id: gameId,
            game_player_id: player.id,
            recipient_id: winnerPlayer.id,
            type: "reentry_payment",
            amount: game.price_per_reentry * player.reentry_count,
          });
        }
      }
    }
  }

  revalidatePath(`/partidas/${gameId}`);
}

// Eliminar partida
export async function deleteGame(gameId: string) {
  const supabase = await createClient();
  await supabase.from("games").delete().eq("id", gameId);
  revalidatePath("/");
  redirect("/");
}

// Pausar partida (volver a waiting)
export async function pauseGame(gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("games")
    .update({ status: "waiting" })
    .eq("id", gameId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/partidas/${gameId}`);
}

// Reanudar partida (volver a in_progress)
export async function resumeGame(gameId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("games")
    .update({ status: "in_progress" })
    .eq("id", gameId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/partidas/${gameId}`);
}
