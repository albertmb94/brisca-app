export type GameStatus = 'waiting' | 'in_progress' | 'finished';
export type PlayerStatus = 'active' | 'eliminated' | 'winner';
export type TransactionType = 'round_payment' | 'game_payment' | 'reentry_payment';

export interface Game {
  id: string;
  name: string;
  status: GameStatus;
  max_players: number;
  target_score: number;
  price_per_round: number;
  price_per_game: number;
  price_per_reentry: number;
  created_at: string;
  ended_at?: string;
  winner_id?: string;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  guest_name: string;
  current_score: number;
  status: PlayerStatus;
  reentry_count: number;
  total_rounds_won: number;
  position: number;
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  winner_id?: string;
  completed_at?: string;
}

export interface RoundScore {
  id: string;
  round_id: string;
  game_player_id: string;
  points: number;
}

export interface RoundWithScores extends Round {
  scores: (RoundScore & { game_player: GamePlayer })[];
}

export interface Transaction {
  id: string;
  game_id: string;
  game_player_id: string;
  recipient_id?: string;
  type: TransactionType;
  amount: number;
  round_number?: number;
  created_at: string;
}

export interface GameWithPlayers extends Game {
  players: GamePlayer[];
  rounds: RoundWithScores[];
  transactions: Transaction[];
}

export interface SettlementSummary {
  player: GamePlayer;
  totalPaid: number;
  totalReceived: number;
  balance: number;
  reentries: number;
  roundsWon: number;
}
