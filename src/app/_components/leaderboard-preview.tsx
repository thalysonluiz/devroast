import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";
import { caller } from "@/trpc/server";
import { LeaderboardCodeCell } from "./leaderboard-code-cell";

const RANK_COLORS = [
  "text-accent-amber",
  "text-text-secondary",
  "text-text-secondary",
];

export async function LeaderboardPreview() {
  const [entries, metrics] = await Promise.all([
    caller.leaderboard.getTopShame(),
    caller.metrics.getMetrics(),
  ]);

  return (
    <>
      <div className="border border-border-primary overflow-hidden">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={
              i < entries.length - 1
                ? "border-b border-border-primary"
                : undefined
            }
          >
            {/* Meta row */}
            <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
              {/* Left: rank + score */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[13px] text-text-tertiary">
                    #
                  </span>
                  <span
                    className={`font-mono text-[13px] font-bold ${RANK_COLORS[i] ?? "text-text-secondary"}`}
                  >
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

            {/* Collapsible code block */}
            <LeaderboardCodeCell lineCount={entry.lineCount}>
              <CodeBlock
                code={entry.code as string}
                lang={entry.language as BundledLanguage}
                bare
              />
            </LeaderboardCodeCell>
          </div>
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
