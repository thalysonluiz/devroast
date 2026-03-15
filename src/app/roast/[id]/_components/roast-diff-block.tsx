import { DiffLine } from "@/components/ui/diff-line";

type DiffEntry =
  | { type: "context"; code: string }
  | { type: "removed"; code: string }
  | { type: "added"; code: string };

type RoastDiffBlockProps = {
  fromFile: string;
  toFile: string;
  lines: DiffEntry[];
};

export function RoastDiffBlock({
  fromFile,
  toFile,
  lines,
}: RoastDiffBlockProps) {
  return (
    <div className="border border-border-primary overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-10 px-4 border-b border-border-primary bg-bg-input">
        <span className="font-mono text-[12px] font-medium text-text-secondary">
          {fromFile} → {toFile}
        </span>
      </div>

      {/* Diff body */}
      <div className="flex flex-col py-1 bg-bg-input">
        {lines.map((line, i) => (
          <DiffLine
            // biome-ignore lint/suspicious/noArrayIndexKey: static list, no reordering
            key={i}
            variant={line.type}
            code={line.code}
          />
        ))}
      </div>
    </div>
  );
}
