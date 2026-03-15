import { cacheLife, cacheTag } from "next/cache";
import { caller } from "@/trpc/server";
import { LeaderboardMetricsNumbers } from "./leaderboard-metrics-numbers";

export async function LeaderboardMetrics() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag("metrics");

  const result = await caller.metrics.getMetrics();

  return (
    <LeaderboardMetricsNumbers
      totalRoasts={result.totalRoasts as number}
      avgScore={result.avgScore as number}
    />
  );
}
