"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

type LeaderboardMetricsNumbersProps = {
  totalRoasts: number;
  avgScore: number;
};

export function LeaderboardMetricsNumbers({
  totalRoasts,
  avgScore,
}: LeaderboardMetricsNumbersProps) {
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayAvg, setDisplayAvg] = useState(0);

  useEffect(() => {
    setDisplayTotal(totalRoasts);
    setDisplayAvg(avgScore);
  }, [totalRoasts, avgScore]);

  return (
    <div className="flex items-center gap-2">
      <span
        className="font-mono text-[12px] text-text-tertiary"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        <NumberFlow
          value={displayTotal}
          format={{ useGrouping: true }}
          className="tabular-nums"
        />{" "}
        submissions
      </span>
      <span className="font-mono text-[12px] text-text-tertiary">·</span>
      <span
        className="font-mono text-[12px] text-text-tertiary"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        avg score:{" "}
        <NumberFlow
          value={displayAvg}
          format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
          className="tabular-nums"
        />
        /10
      </span>
    </div>
  );
}
