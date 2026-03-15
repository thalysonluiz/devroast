import { caller } from "@/trpc/server";
import { MetricsNumbers } from "./metrics-numbers";

export async function MetricsDisplay() {
  const result = await caller.metrics.getMetrics();

  return (
    <MetricsNumbers
      totalRoasts={result.totalRoasts as number}
      avgScore={result.avgScore as number}
    />
  );
}
