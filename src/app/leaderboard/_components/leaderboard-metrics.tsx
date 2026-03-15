import { caller } from "@/trpc/server";
import { LeaderboardMetricsNumbers } from "./leaderboard-metrics-numbers";

export async function LeaderboardMetrics() {
  const result = await caller.metrics.getMetrics();

  return (
    <LeaderboardMetricsNumbers
      totalRoasts={result.totalRoasts as number}
      avgScore={result.avgScore as number}
    />
  );
}
