-- ============================================================
-- BRISCA APP - SCHEMA
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================================

-- Tabla de partidas
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished')),
  max_players INT NOT NULL DEFAULT 8,
  target_score INT NOT NULL DEFAULT 150,
  price_per_round DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_game DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_reentry DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  winner_id UUID
);

-- Tabla de jugadores en partida (invitados, solo nombre)
CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  current_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'winner')),
  reentry_count INT NOT NULL DEFAULT 0,
  total_rounds_won INT NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de rondas
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  winner_id UUID REFERENCES game_players(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de puntuaciones por ronda
CREATE TABLE round_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  game_player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de transacciones económicas
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  game_player_id UUID NOT NULL REFERENCES game_players(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES game_players(id),
  type TEXT NOT NULL CHECK (type IN ('round_payment', 'game_payment', 'reentry_payment')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  round_number INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_game_players_game ON game_players(game_id);
CREATE INDEX idx_rounds_game ON rounds(game_id);
CREATE INDEX idx_round_scores_round ON round_scores(round_id);
CREATE INDEX idx_transactions_game ON transactions(game_id);

-- Función para finalizar ronda y aplicar reenganches
CREATE OR REPLACE FUNCTION process_round_end(p_game_id UUID, p_round_id UUID)
RETURNS TABLE(
  player_id UUID,
  player_name TEXT,
  old_score INT,
  new_score INT,
  reentered BOOLEAN,
  eliminated BOOLEAN
) AS $$
DECLARE
  v_target INT;
  v_alive_count INT;
  v_max_alive INT;
  v_player RECORD;
BEGIN
  -- Obtener puntuación objetivo
  SELECT target_score INTO v_target FROM games WHERE id = p_game_id;

  -- Contar jugadores vivos (<= target)
  SELECT COUNT(*) INTO v_alive_count
  FROM game_players
  WHERE game_id = p_game_id AND current_score <= v_target;

  -- Obtener máximo puntaje entre vivos (para reenganche)
  SELECT COALESCE(MAX(current_score), 0) INTO v_max_alive
  FROM game_players
  WHERE game_id = p_game_id AND current_score <= v_target;

  -- Procesar jugadores que pasaron el target
  FOR v_player IN
    SELECT gp.id, gp.guest_name, gp.current_score
    FROM game_players gp
    WHERE gp.game_id = p_game_id
      AND gp.status = 'active'
      AND gp.current_score > v_target
    ORDER BY gp.position
  LOOP
    IF v_alive_count >= 2 THEN
      -- Reenganche: igualar al mayor vivo
      UPDATE game_players
      SET current_score = v_max_alive,
          reentry_count = reentry_count + 1,
          status = 'active'
      WHERE id = v_player.id;

      -- Crear transacción de reenganche
      INSERT INTO transactions (game_id, game_player_id, type, amount)
      SELECT p_game_id, v_player.id, 'reentry_payment', price_per_reentry
      FROM games WHERE id = p_game_id;

      player_id := v_player.id;
      player_name := v_player.guest_name;
      old_score := v_player.current_score;
      new_score := v_max_alive;
      reentered := true;
      eliminated := false;
      RETURN NEXT;
    ELSE
      -- Eliminado directo
      UPDATE game_players
      SET status = 'eliminated'
      WHERE id = v_player.id;

      player_id := v_player.id;
      player_name := v_player.guest_name;
      old_score := v_player.current_score;
      new_score := v_player.current_score;
      reentered := false;
      eliminated := true;
      RETURN NEXT;
    END IF;
  END LOOP;

  -- Verificar si hay ganador (solo 1 vivo o menos)
  SELECT COUNT(*) INTO v_alive_count
  FROM game_players
  WHERE game_id = p_game_id AND current_score <= v_target AND status = 'active';

  IF v_alive_count <= 1 THEN
    -- Declarar ganador
    UPDATE game_players
    SET status = 'winner'
    WHERE id = (
      SELECT id FROM game_players
      WHERE game_id = p_game_id AND current_score <= v_target AND status = 'active'
      LIMIT 1
    );

    -- Finalizar partida
    UPDATE games
    SET status = 'finished',
        ended_at = now(),
        winner_id = (
          SELECT id FROM game_players
          WHERE game_id = p_game_id AND status = 'winner' LIMIT 1
        )
    WHERE id = p_game_id;
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS básicas (permitir todo para facilitar desarrollo,
-- en producción se deberían restringir)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_games" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_players" ON game_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_rounds" ON rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_scores" ON round_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
