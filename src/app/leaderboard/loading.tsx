import { LeaderboardListSkeleton } from "./_components/leaderboard-list-skeleton";
import { LeaderboardMetricsSkeleton } from "./_components/leaderboard-metrics-skeleton";

export default function LeaderboardLoading() {
  return (
    <main className="flex flex-col items-center px-4 sm:px-10">
      <div className="flex flex-col gap-10 w-full max-w-[960px] pt-12 sm:pt-16 pb-16">
        {/* Hero */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-[28px] sm:text-[32px] font-bold text-accent-green leading-none">
                {">"}
              </span>
              <span className="font-mono text-[28px] sm:text-[32px] font-bold text-text-primary leading-none">
                shame_leaderboard
              </span>
            </div>
            <p
              className="text-[14px] text-text-secondary"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              {"// the most roasted code on the internet"}
            </p>
          </div>

          <LeaderboardMetricsSkeleton />
        </div>

        <LeaderboardListSkeleton />
      </div>
    </main>
  );
}
