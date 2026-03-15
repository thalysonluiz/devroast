import type { Metadata } from "next";
import type { BundledLanguage } from "shiki";
import { LeaderboardEntry } from "./_components/leaderboard-entry";

export const metadata: Metadata = {
  title: "Shame Leaderboard — devroast",
  description:
    "The most roasted code on the internet, ranked by shame. 2,847 submissions and counting.",
};

type LeaderboardItem = {
  rank: number;
  score: string;
  code: string;
  lang: BundledLanguage;
  lines: number;
};

async function getLeaderboard(): Promise<LeaderboardItem[]> {
  return [
    {
      rank: 1,
      score: "1.2",
      lang: "javascript",
      lines: 3,
      code: `eval(prompt("enter code"))\ndocument.write(response)\n// trust the user lol`,
    },
    {
      rank: 2,
      score: "1.8",
      lang: "typescript",
      lines: 3,
      code: `if (x == true) {\n  while (if (a == false) { return false; })\n  else { return true; }\n}`,
    },
    {
      rank: 3,
      score: "2.1",
      lang: "sql",
      lines: 2,
      code: `SELECT * FROM users WHERE name LIKE '%admin%'\n-- TODO: add authentication/filters`,
    },
    {
      rank: 4,
      score: "2.3",
      lang: "java",
      lines: 3,
      code: `catch (Exception e) {\n  // it works\n}`,
    },
    {
      rank: 5,
      score: "2.5",
      lang: "javascript",
      lines: 3,
      code: `const sleep = (ms) => new Promise(r => setTimeout(r, ms))\nawait Promise.all(data.map(x => sleep(1000)))\nconsole.log(data)`,
    },
  ];
}

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <main className="flex flex-col items-center px-4 sm:px-10">
      <div className="flex flex-col gap-10 w-full max-w-[960px] pt-12 sm:pt-16 pb-16">
        {/* ── Hero Section ── */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-[28px] sm:text-[32px] font-bold text-accent-green leading-none">
                {">"}
              </span>
              <span className="font-mono text-[28px] sm:text-[32px] font-bold text-text-primary leading-none">
                shame_leaderboard
              </span>
            </div>

            <p
              className="text-[14px] text-text-secondary"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              {"// the most roasted code on the internet"}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[12px] text-text-tertiary"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              2,847 submissions
            </span>
            <span
              className="font-mono text-[12px] text-text-tertiary"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              ·
            </span>
            <span
              className="font-mono text-[12px] text-text-tertiary"
              style={{ fontFamily: "IBM Plex Mono, monospace" }}
            >
              avg score: 4.2/10
            </span>
          </div>
        </div>

        {/* ── Leaderboard Entries ── */}
        <div className="flex flex-col gap-5">
          {entries.map((entry) => (
            <LeaderboardEntry
              key={entry.rank}
              rank={entry.rank}
              score={entry.score}
              code={entry.code}
              lang={entry.lang}
              lines={entry.lines}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
