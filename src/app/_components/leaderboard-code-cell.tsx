"use client";

import { type ReactNode, useState } from "react";

type LeaderboardCodeCellProps = {
  children: ReactNode;
  lineCount: number;
};

// text-[13px] leading-relaxed (1.625) + p-4 top/bottom (32px) ≈ 3 lines visible
const COLLAPSED_HEIGHT = "95px";

export function LeaderboardCodeCell({
  children,
  lineCount,
}: LeaderboardCodeCellProps) {
  const [open, setOpen] = useState(false);
  const showToggle = lineCount > 4;

  if (!showToggle) {
    return (
      <div style={{ minHeight: COLLAPSED_HEIGHT, overflow: "hidden" }}>
        {children}
      </div>
    );
  }

  return (
    <div>
      <div
        style={
          open
            ? { minHeight: COLLAPSED_HEIGHT }
            : {
                maxHeight: COLLAPSED_HEIGHT,
                minHeight: COLLAPSED_HEIGHT,
                overflow: "hidden",
              }
        }
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 border-t border-border-primary font-mono text-[11px] text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
      >
        {open ? "▴ show less" : "▸ show more"}
      </button>
    </div>
  );
}
