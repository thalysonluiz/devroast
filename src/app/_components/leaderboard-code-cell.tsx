"use client";

import { Collapsible } from "@base-ui/react";
import { type ReactNode, useState } from "react";

type LeaderboardCodeCellProps = {
  children: ReactNode;
  lineCount: number;
};

export function LeaderboardCodeCell({
  children,
  lineCount,
}: LeaderboardCodeCellProps) {
  const [open, setOpen] = useState(false);
  const showToggle = lineCount > 5;

  if (!showToggle) {
    return <div className="overflow-hidden">{children}</div>;
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className={open ? undefined : "max-h-[120px] overflow-hidden"}>
        <Collapsible.Panel keepMounted>{children}</Collapsible.Panel>
      </div>
      <Collapsible.Trigger className="w-full flex items-center justify-center gap-1.5 py-1.5 border-t border-border-primary font-mono text-[11px] text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
        {open ? "▴ show less" : "▸ show more"}
      </Collapsible.Trigger>
    </Collapsible.Root>
  );
}
