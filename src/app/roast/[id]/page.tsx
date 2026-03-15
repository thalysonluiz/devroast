import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BundledLanguage } from "shiki";
import { CodeBlock } from "@/components/ui/code-block";
import { ScoreRing } from "@/components/ui/score-ring";
import { caller } from "@/trpc/server";
import { IssueCard } from "./_components/issue-card";
import { RoastDiffBlock } from "./_components/roast-diff-block";

export const metadata: Metadata = {
  title: "Roast Results — devroast",
  description: "See the full AI-powered roast of your code submission.",
};

// Verdict styles covering all verdict enum values.
const verdictStyles = {
  clean_code: {
    dot: "bg-accent-green",
    text: "text-accent-green",
    label: "verdict: clean_code",
  },
  needs_work: {
    dot: "bg-accent-amber",
    text: "text-accent-amber",
    label: "verdict: needs_work",
  },
  needs_serious_help: {
    dot: "bg-accent-red",
    text: "text-accent-red",
    label: "verdict: needs_serious_help",
  },
  what_is_this: {
    dot: "bg-accent-red",
    text: "text-accent-red",
    label: "verdict: what_is_this",
  },
  unroastable: {
    dot: "bg-accent-green",
    text: "text-accent-green",
    label: "verdict: unroastable",
  },
};

type DiffEntry =
  | { type: "context"; code: string }
  | { type: "removed"; code: string }
  | { type: "added"; code: string };

function parseSuggestedFix(raw: string): DiffEntry[] {
  return raw
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line): DiffEntry => {
      const pipeIndex = line.indexOf("|");
      if (pipeIndex === -1) return { type: "context", code: line };
      const type = line.slice(0, pipeIndex) as DiffEntry["type"];
      const code = line.slice(pipeIndex + 1);
      if (type === "removed" || type === "added" || type === "context") {
        return { type, code };
      }
      return { type: "context", code };
    });
}

type RoastPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoastPage({ params }: RoastPageProps) {
  const { id } = await params;

  let roast: Awaited<ReturnType<typeof caller.roasts.getRoastById>>;
  try {
    roast = await caller.roasts.getRoastById({ id });
  } catch {
    notFound();
  }

  const verdict = verdictStyles[roast.verdict];

  return (
    <main className="flex flex-col items-center px-4 sm:px-10">
      <div className="flex flex-col gap-10 w-full max-w-[960px] pt-12 sm:pt-16 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-12">
          <div className="shrink-0">
            <ScoreRing score={roast.score} />
          </div>

          <div className="flex flex-col gap-4 flex-1 min-w-0">
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

            <p
              className="text-[18px] sm:text-[20px] text-text-primary leading-relaxed"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              {roast.roastQuote}
            </p>

            <div className="flex items-center gap-4">
              <span className="font-mono text-[12px] text-text-tertiary">
                lang: {roast.submission.language}
              </span>
              <span className="font-mono text-[12px] text-text-tertiary">·</span>
              <span className="font-mono text-[12px] text-text-tertiary">
                {roast.submission.lineCount} lines
              </span>
            </div>

            <div>
              <button
                type="button"
                disabled
                className="font-mono text-[12px] text-text-tertiary border border-border-primary px-4 py-2 opacity-40 cursor-not-allowed bg-transparent"
              >
                $ share_roast
              </button>
            </div>
          </div>
        </div>

        <hr className="border-none h-px bg-border-primary" />

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
            <CodeBlock
              code={roast.submission.code}
              lang={roast.submission.language.toLowerCase() as BundledLanguage}
              bare
            />
          </div>
        </div>

        <hr className="border-none h-px bg-border-primary" />

        {roast.issues.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[14px] font-bold text-accent-green">
                {"//"}
              </span>
              <span className="font-mono text-[14px] font-bold text-text-primary">
                detailed_analysis
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {Array.from(
                { length: Math.ceil(roast.issues.length / 2) },
                (_, row) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static layout rows
                  <div key={row} className="flex flex-col sm:flex-row gap-5">
                    {roast.issues.slice(row * 2, row * 2 + 2).map((issue) => (
                      <IssueCard
                        key={issue.id}
                        variant={issue.severity}
                        title={issue.title}
                        description={issue.description}
                      />
                    ))}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {roast.suggestedFix && (
          <>
            <hr className="border-none h-px bg-border-primary" />

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
                fromFile={`your_code.${roast.submission.language.toLowerCase()}`}
                toFile={`improved_code.${roast.submission.language.toLowerCase()}`}
                lines={parseSuggestedFix(roast.suggestedFix)}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
