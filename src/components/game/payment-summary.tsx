"use client";

import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaymentSummaryProps {
  game: any;
}

export function PaymentSummary({ game }: PaymentSummaryProps) {
  const players = game.players || [];
  const transactions = game.transactions || [];

  // Calcular balances
  const summary = players.map((player: any) => {
    const paid = transactions
      .filter((t: any) => t.game_player_id === player.id)
      .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

    const received = transactions
      .filter((t: any) => t.recipient_id === player.id)
      .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

    return {
      player,
      paid,
      received,
      balance: received - paid,
    };
  });

  const winner = players.find((p: any) => p.status === "winner");

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Resumen Final
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {winner && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-muted-foreground">Ganador</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {winner.guest_name}
            </p>
            <p className="text-sm mt-1">
              {winner.current_score} puntos · {winner.total_rounds_won} rondas ganadas
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Jugador</th>
                <th className="text-right py-2 px-2">Pagado</th>
                <th className="text-right py-2 px-2">Recibido</th>
                <th className="text-right py-2 px-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item: any) => (
                <tr key={item.player.id} className="border-b last:border-0">
                  <td className="py-3 px-2 font-medium">{item.player.guest_name}</td>
                  <td className="text-right py-3 px-2 text-red-600">
                    -{item.paid.toFixed(2)}€
                  </td>
                  <td className="text-right py-3 px-2 text-green-600">
                    +{item.received.toFixed(2)}€
                  </td>
                  <td className="text-right py-3 px-2">
                    <span
                      className={cn(
                        "font-bold inline-flex items-center gap-1",
                        item.balance > 0 && "text-green-600",
                        item.balance < 0 && "text-red-600",
                        item.balance === 0 && "text-muted-foreground"
                      )}
                    >
                      {item.balance > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : item.balance < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {item.balance > 0 ? "+" : ""}
                      {item.balance.toFixed(2)}€
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detalle de transacciones */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Detalle de transacciones</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto text-sm">
            {transactions.map((t: any) => {
              const payer = players.find((p: any) => p.id === t.game_player_id);
              const recipient = players.find((p: any) => p.id === t.recipient_id);

              let label = "";
              if (t.type === "round_payment") label = `Ronda ${t.round_number}`;
              else if (t.type === "game_payment") label = "Partida";
              else if (t.type === "reentry_payment") label = "Reenganche";

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50"
                >
                  <span className="text-muted-foreground">
                    {label}
                    {recipient && (
                      <span className="text-foreground"> → {recipient.guest_name}</span>
                    )}
                  </span>
                  <span className="font-medium">
                    {payer?.guest_name}: {parseFloat(t.amount).toFixed(2)}€
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
