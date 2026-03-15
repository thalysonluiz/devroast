import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type ScoreRingProps = ComponentProps<"div"> & {
  score: number;
  maxScore?: number;
};

export function ScoreRing({
  score,
  maxScore = 10,
  className,
  ...props
}: ScoreRingProps) {
  const size = 180;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);
  const dashOffset = circumference * (1 - ratio);

  const gradientId = "score-ring-gradient";

  return (
    <div
      className={twMerge(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="36%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
        />

        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="relative flex items-baseline gap-0.5">
        <span className="font-mono font-bold text-5xl leading-none text-text-primary">
          {score.toFixed(1)}
        </span>
        <span className="font-mono text-base text-text-tertiary leading-none">
          /{maxScore}
        </span>
      </div>
    </div>
  );
}
