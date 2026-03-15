export function LeaderboardMetricsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-24 h-3 bg-bg-surface rounded-sm animate-pulse" />
      <span className="font-mono text-[12px] text-text-tertiary">·</span>
      <span className="inline-block w-32 h-3 bg-bg-surface rounded-sm animate-pulse" />
    </div>
  );
}
