import { connection } from "next/server";
import { Suspense } from "react";
import type { BundledLanguage } from "shiki";
import { caller } from "@/trpc/server";
import { LeaderboardEntry } from "./leaderboard-entry";
import { LeaderboardEntrySkeleton } from "./leaderboard-entry-skeleton";

export async function LeaderboardList() {
  await connection();
  const entries = await caller.leaderboard.getShameLeaderboard();

  return (
    <div className="flex flex-col gap-5">
      {entries.map((entry) => (
        <Suspense key={entry.id} fallback={<LeaderboardEntrySkeleton />}>
          <LeaderboardEntry
            rank={entry.rank}
            score={entry.score as number}
            code={entry.code as string}
            lang={entry.language as BundledLanguage}
            lines={entry.lineCount as number}
          />
        </Suspense>
      ))}
    </div>
  );
}
