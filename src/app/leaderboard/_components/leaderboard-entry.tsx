import { cacheLife, cacheTag } from "next/cache";
import type { BundledLanguage } from "shiki";
import { LeaderboardCodeCell } from "@/app/_components/leaderboard-code-cell";
import { CodeBlock } from "@/components/ui/code-block";

type LeaderboardEntryProps = {
  rank: number;
  score: number;
  code: string;
  lang: BundledLanguage;
  lines: number;
};

export async function LeaderboardEntry({
  rank,
  score,
  code,
  lang,
  lines,
}: LeaderboardEntryProps) {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag("leaderboard");

  return (
    <div className="border border-border-primary overflow-hidden">
      {/* Meta Row */}
      <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
        {/* Left: rank + score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[13px] text-text-tertiary">#</span>
            <span className="font-mono text-[13px] font-bold text-accent-amber">
              {rank}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] text-text-tertiary">
              score:
            </span>
            <span className="font-mono text-[13px] font-bold text-accent-red">
              {score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right: lang + lines */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] text-text-secondary">
            {lang}
          </span>
          <span className="font-mono text-[12px] text-text-tertiary">
            {lines} {lines === 1 ? "line" : "lines"}
          </span>
        </div>
      </div>

      {/* Collapsible code block */}
      <LeaderboardCodeCell lineCount={lines}>
        <CodeBlock code={code} lang={lang} bare />
      </LeaderboardCodeCell>
    </div>
  );
}
