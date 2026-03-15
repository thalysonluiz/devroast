import { LeaderboardEntrySkeleton } from "./leaderboard-entry-skeleton";

export function LeaderboardListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <LeaderboardEntrySkeleton key={i} />
      ))}
    </div>
  );
}
