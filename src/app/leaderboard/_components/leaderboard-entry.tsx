import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";

type LeaderboardEntryProps = {
  rank: number;
  score: string;
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
              {score}
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

      {/* Code Block */}
      <div className="h-[120px] overflow-hidden">
        <CodeBlock code={code} lang={lang} bare />
      </div>
    </div>
  );
}
