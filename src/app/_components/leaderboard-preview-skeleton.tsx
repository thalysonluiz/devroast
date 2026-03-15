export function LeaderboardPreviewSkeleton() {
  return (
    <>
      <div className="border border-border-primary overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={i < 3 ? "border-b border-border-primary" : undefined}
          >
            {/* Meta row skeleton */}
            <div className="flex items-center justify-between h-12 px-5 border-b border-border-primary">
              {/* Left: rank + score */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[13px] text-text-tertiary">
                    #
                  </span>
                  <span className="inline-block w-3 h-3 bg-bg-surface rounded-sm animate-pulse" />
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
                <span className="inline-block w-14 h-3 bg-bg-surface rounded-sm animate-pulse" />
                <span className="inline-block w-10 h-3 bg-bg-surface rounded-sm animate-pulse" />
              </div>
            </div>

            {/* Code block skeleton */}
            <div className="h-[120px] bg-bg-input animate-pulse" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <p className="text-center text-[12px] text-text-tertiary font-mono">
        <span className="inline-block w-48 h-3 bg-bg-surface rounded-sm animate-pulse" />
      </p>
    </>
  );
}
