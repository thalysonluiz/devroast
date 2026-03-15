import { cacheLife, cacheTag } from "next/cache";
import { caller } from "@/trpc/server";
import { MetricsNumbers } from "./metrics-numbers";

export async function MetricsDisplay() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag("metrics");

  const result = await caller.metrics.getMetrics();

  return (
    <MetricsNumbers
      totalRoasts={result.totalRoasts as number}
      avgScore={result.avgScore as number}
    />
  );
}
