import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import type { BundledLanguage } from "shiki";
import { codeToHast } from "shiki";
import { twMerge } from "tailwind-merge";

type CodeBlockProps = {
  code: string;
  lang: BundledLanguage;
  fileName?: string;
  className?: string;
  bare?: boolean;
};

export async function CodeBlock({
  code,
  lang,
  fileName,
  className,
  bare = false,
}: CodeBlockProps) {
  const hast = await codeToHast(code, {
    lang,
    theme: "vesper",
  });

  const content = toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components: {
      pre: ({ children, style }) => (
        <pre
          style={style}
          className="p-4 text-[13px] leading-relaxed overflow-x-auto"
        >
          {children}
        </pre>
      ),
    },
  });

  return (
    <div
      className={twMerge(
        "border border-border-primary overflow-hidden font-mono",
        bare && "border-0",
        className,
      )}
    >
      {/* Header */}
      {!bare && (
        <div className="flex items-center gap-3 px-4 h-10 border-b border-border-primary bg-bg-surface">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-red" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
          <span className="flex-1" />
          {fileName && (
            <span className="text-xs text-text-tertiary">{fileName}</span>
          )}
        </div>
      )}

      {content}
    </div>
  );
}
