"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

type MetricsNumbersProps = {
  totalRoasts: number;
  avgScore: number;
};

export function MetricsNumbers({ totalRoasts, avgScore }: MetricsNumbersProps) {
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayAvg, setDisplayAvg] = useState(0);

  useEffect(() => {
    setDisplayTotal(totalRoasts);
    setDisplayAvg(avgScore);
  }, [totalRoasts, avgScore]);

  return (
    <p
      className="text-center text-[12px] text-text-tertiary"
      style={{ fontFamily: "IBM Plex Mono, monospace" }}
    >
      <NumberFlow
        value={displayTotal}
        format={{ useGrouping: true }}
        className="tabular-nums"
      />{" "}
      codes roasted · avg score:{" "}
      <NumberFlow
        value={displayAvg}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        className="tabular-nums"
      />
      /10
    </p>
  );
}
