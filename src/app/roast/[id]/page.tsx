import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/code-block";
import { ScoreRing } from "@/components/ui/score-ring";
import { IssueCard } from "./_components/issue-card";
import { RoastDiffBlock } from "./_components/roast-diff-block";

export const metadata: Metadata = {
  title: "Roast Results — devroast",
  description: "See the full AI-powered roast of your code submission.",
};

// ── Static data (replace with DB fetch keyed by `id` later) ────────────────

const STATIC_ROAST = {
  score: 3.5,
  verdict: "needs_serious_help" as const,
  roastQuote:
    '"this code looks like it was written during a power outage... in 2005."',
  lang: "javascript",
  submittedCode: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  issues: [
    {
      variant: "critical" as const,
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      variant: "warning" as const,
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      variant: "good" as const,
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
    },
    {
      variant: "good" as const,
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
    },
  ],
  diff: {
    fromFile: "your_code.js",
    toFile: "improved_code.js",
    lines: [
      { type: "context" as const, code: "function calculateTotal(items) {" },
      { type: "removed" as const, code: "  var total = 0;" },
      {
        type: "removed" as const,
        code: "  for (var i = 0; i < items.length; i++) {",
      },
      {
        type: "removed" as const,
        code: "    total = total + items[i].price;",
      },
      { type: "removed" as const, code: "  }" },
      { type: "removed" as const, code: "  return total;" },
      {
        type: "added" as const,
        code: "  return items.reduce((sum, item) => sum + item.price, 0);",
      },
      { type: "context" as const, code: "}" },
    ],
  },
};

const verdictStyles = {
  needs_serious_help: {
    dot: "bg-accent-red",
    text: "text-accent-red",
    label: "verdict: needs_serious_help",
  },
  could_be_worse: {
    dot: "bg-accent-amber",
    text: "text-accent-amber",
    label: "verdict: could_be_worse",
  },
  not_bad: {
    dot: "bg-accent-green",
    text: "text-accent-green",
    label: "verdict: not_bad",
  },
};

type RoastPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoastPage({ params }: RoastPageProps) {
  // `id` will be used for DB lookup once the backend is wired up
  const { id: _id } = await params;
  const roast = STATIC_ROAST;

  const verdict = verdictStyles[roast.verdict];
  const lineCount = roast.submittedCode.split("\n").length;

  return (
    <main className="flex flex-col items-center px-4 sm:px-10">
      <div className="flex flex-col gap-10 w-full max-w-[960px] pt-12 sm:pt-16 pb-16">
        {/* ── Score Hero ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-12">
          {/* Score ring */}
          <div className="shrink-0">
            <ScoreRing score={roast.score} />
          </div>

          {/* Roast summary */}
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            {/* Verdict badge */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${verdict.dot}`}
              />
              <span
                className={`font-mono text-[13px] font-medium ${verdict.text}`}
              >
                {verdict.label}
              </span>
            </div>

            {/* Roast quote */}
            <p
              className="text-[18px] sm:text-[20px] text-text-primary leading-relaxed"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              {roast.roastQuote}
            </p>

            {/* Meta: lang + lines */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-[12px] text-text-tertiary">
                lang: {roast.lang}
              </span>
              <span className="font-mono text-[12px] text-text-tertiary">
                ·
              </span>
              <span className="font-mono text-[12px] text-text-tertiary">
                {lineCount} lines
              </span>
            </div>

            {/* Share button */}
            <div>
              <button
                type="button"
                className="font-mono text-[12px] text-text-primary border border-border-primary px-4 py-2 hover:border-text-tertiary transition-colors cursor-pointer bg-transparent"
              >
                $ share_roast
              </button>
            </div>
          </div>
        </div>

        {/* divider */}
        <hr className="border-none h-px bg-border-primary" />

        {/* ── Submitted Code ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-[14px] font-bold text-text-primary">
              your_submission
            </span>
          </div>

          <div className="max-h-[424px] overflow-hidden border border-border-primary">
            <CodeBlock code={roast.submittedCode} lang="javascript" bare />
          </div>
        </div>

        {/* divider */}
        <hr className="border-none h-px bg-border-primary" />

        {/* ── Detailed Analysis ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-[14px] font-bold text-text-primary">
              detailed_analysis
            </span>
          </div>

          {/* Issues grid: 2 columns, 2 rows */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-5">
              {roast.issues.slice(0, 2).map((issue) => (
                <IssueCard
                  key={issue.title}
                  variant={issue.variant}
                  title={issue.title}
                  description={issue.description}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-5">
              {roast.issues.slice(2, 4).map((issue) => (
                <IssueCard
                  key={issue.title}
                  variant={issue.variant}
                  title={issue.title}
                  description={issue.description}
                />
              ))}
            </div>
          </div>
        </div>

        {/* divider */}
        <hr className="border-none h-px bg-border-primary" />

        {/* ── Suggested Fix (Diff) ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-[14px] font-bold text-text-primary">
              suggested_fix
            </span>
          </div>

          <RoastDiffBlock
            fromFile={roast.diff.fromFile}
            toFile={roast.diff.toFile}
            lines={roast.diff.lines}
          />
        </div>
      </div>
    </main>
  );
}
