import type { BundledLanguage } from "shiki";
import { caller } from "@/trpc/server";
import { LeaderboardEntry } from "./leaderboard-entry";

export async function LeaderboardList() {
  const entries = await caller.leaderboard.getShameLeaderboard();

  return (
    <div className="flex flex-col gap-5">
      {entries.map((entry) => (
        <LeaderboardEntry
          key={entry.id}
          rank={entry.rank}
          score={entry.score as number}
          code={entry.code as string}
          lang={entry.language as BundledLanguage}
          lines={entry.lineCount as number}
        />
      ))}
    </div>
  );
}
