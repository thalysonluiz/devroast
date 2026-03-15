export function LeaderboardEntrySkeleton() {
  return (
    <div className="border border-border-primary overflow-hidden">
      {/* Meta row skeleton */}
      <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
        {/* Left: rank + score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[13px] text-text-tertiary">#</span>
            <span className="inline-block w-4 h-3 bg-bg-surface rounded-sm animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[12px] text-text-tertiary">
              score:
            </span>
            <span className="inline-block w-8 h-3 bg-bg-surface rounded-sm animate-pulse" />
          </div>
        </div>

        {/* Right: lang + lines */}
        <div className="flex items-center gap-3">
          <span className="inline-block w-16 h-3 bg-bg-surface rounded-sm animate-pulse" />
          <span className="inline-block w-12 h-3 bg-bg-surface rounded-sm animate-pulse" />
        </div>
      </div>

      {/* Code block skeleton — matches ~3 lines of text-[13px] leading-relaxed + p-4 */}
      <div className="h-[95px] bg-bg-input animate-pulse" />
    </div>
  );
}
