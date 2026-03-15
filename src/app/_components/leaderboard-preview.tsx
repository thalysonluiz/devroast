import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { Suspense } from "react";
import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";
import { caller } from "@/trpc/server";
import { LeaderboardCodeCell } from "./leaderboard-code-cell";

const RANK_COLORS = [
  "text-accent-amber",
  "text-text-secondary",
  "text-text-secondary",
];

type PreviewEntryData = {
  id: string;
  rank: number;
  score: number;
  language: string;
  lineCount: number;
  code: string;
};

async function PreviewEntryCode({
  code,
  lang,
  lineCount,
}: {
  code: string;
  lang: BundledLanguage;
  lineCount: number;
}) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag("leaderboard");

  return (
    <LeaderboardCodeCell lineCount={lineCount}>
      <CodeBlock code={code} lang={lang} bare />
    </LeaderboardCodeCell>
  );
}

function PreviewEntryCodeSkeleton() {
  return <div className="h-[95px] bg-bg-input animate-pulse" />;
}

function PreviewEntry({
  entry,
  isLast,
  rankColor,
}: {
  entry: PreviewEntryData;
  isLast: boolean;
  rankColor: string;
}) {
  return (
    <div className={isLast ? undefined : "border-b border-border-primary"}>
      {/* Meta row */}
      <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
        {/* Left: rank + score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[13px] text-text-tertiary">#</span>
            <span className={`font-mono text-[13px] font-bold ${rankColor}`}>
              {entry.rank}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] text-text-tertiary">
              score:
            </span>
            <span className="font-mono text-[13px] font-bold text-accent-red">
              {entry.score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right: lang + lines */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-text-secondary">
            {entry.language}
          </span>
          <span className="font-mono text-[12px] text-text-tertiary">
            {entry.lineCount} {entry.lineCount === 1 ? "line" : "lines"}
          </span>
        </div>
      </div>

      {/* Code block — lazy via Suspense so shiki doesn't block the meta row */}
      <Suspense fallback={<PreviewEntryCodeSkeleton />}>
        <PreviewEntryCode
          code={entry.code}
          lang={entry.language as BundledLanguage}
          lineCount={entry.lineCount}
        />
      </Suspense>
    </div>
  );
}

export async function LeaderboardPreview() {
  await connection();
  const [entries, metrics] = await Promise.all([
    caller.leaderboard.getTopShame(),
    caller.metrics.getMetrics(),
  ]);

  return (
    <>
      <div className="border border-border-primary overflow-hidden">
        {entries.map((entry, i) => (
          <PreviewEntry
            key={entry.id}
            entry={entry as PreviewEntryData}
            isLast={i === entries.length - 1}
            rankColor={RANK_COLORS[i] ?? "text-text-secondary"}
          />
        ))}
      </div>

      {/* Footer with total count */}
      <p
        className="text-center text-[12px] text-text-tertiary"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        showing top 3 of{" "}
        {(metrics.totalRoasts as number).toLocaleString("en-US")} ·{" "}
        <a
          href="/leaderboard"
          className="hover:text-text-secondary transition-colors"
        >
          view full leaderboard &gt;&gt;
        </a>
      </p>
    </>
  );
}
