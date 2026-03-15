import { Suspense } from "react";
import { CodeInput } from "./_components/code-input";
import { LeaderboardPreview } from "./_components/leaderboard-preview";
import { LeaderboardPreviewSkeleton } from "./_components/leaderboard-preview-skeleton";
import { MetricsDisplay } from "./_components/metrics";
import { MetricsSkeleton } from "./_components/metrics-skeleton";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4 sm:px-10">
      {/* ── Hero + editor ── */}
      <div className="flex flex-col gap-8 w-full max-w-[780px] pt-12 sm:pt-20">
        {/* Hero title */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-[28px] sm:text-[36px] font-bold text-accent-green leading-none">
              $
            </span>
            <span className="font-mono text-[28px] sm:text-[36px] font-bold text-text-primary leading-none">
              paste your code. get roasted.
            </span>
          </div>
          <p
            className="text-[14px] text-text-secondary leading-relaxed"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            {
              "// drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </p>
        </div>

        {/* Code editor (client) + actions bar */}
        <CodeInput defaultCode="" />

        {/* Footer hint */}
        <Suspense fallback={<MetricsSkeleton />}>
          <MetricsDisplay />
        </Suspense>
      </div>

      {/* ── Leaderboard preview ── */}
      <div className="flex flex-col gap-6 w-full max-w-[960px] mt-16 sm:mt-20">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-[14px] font-bold text-text-primary">
              shame_leaderboard
            </span>
          </div>
          <a
            href="/leaderboard"
            className="font-mono text-[12px] text-text-secondary border border-border-primary px-3 py-1.5 hover:text-text-primary transition-colors"
          >
            $ view_all &gt;&gt;
          </a>
        </div>

        {/* Subtitle */}
        <p
          className="text-[13px] text-text-tertiary -mt-4"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          {"// the worst code on the internet, ranked by shame"}
        </p>

        {/* Table + footer hint */}
        <Suspense fallback={<LeaderboardPreviewSkeleton />}>
          <LeaderboardPreview />
        </Suspense>
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </main>
  );
}
