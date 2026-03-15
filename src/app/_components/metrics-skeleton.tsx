export function MetricsSkeleton() {
  return (
    <p
      className="text-center text-[12px] text-text-tertiary"
      style={{ fontFamily: "IBM Plex Mono, monospace" }}
    >
      <span className="inline-block w-12 h-3 bg-bg-surface rounded-sm animate-pulse" />{" "}
      codes roasted · avg score:{" "}
      <span className="inline-block w-6 h-3 bg-bg-surface rounded-sm animate-pulse" />
      /10
    </p>
  );
}
