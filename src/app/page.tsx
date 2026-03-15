import { CodeInput } from "./_components/code-input";

const SAMPLE_CODE = `async function fetchUser(id) {
  const res = await fetch('/api/users/' + id)
  const data = await res.json()
  // TODO: handle errors lol
  return data
}

var x = 1
if (x == true) {
  console.log("yes")
}

// this definitely works trust me
eval(localStorage.getItem('userScript'))
document.write("<h1>Welcome</h1>")`;

const LEADERBOARD_ROWS = [
  {
    rank: 1,
    score: "1.2",
    code: [
      "eval(prompt('enter command:'))",
      "document.write(response)",
      "// trust the user lol",
    ],
    lang: "javascript",
    rankColor: "text-accent-amber",
  },
  {
    rank: 2,
    score: "1.8",
    code: ["if (x == true) {", "  doSomething()", "}"],
    lang: "typescript",
    rankColor: "text-text-secondary",
  },
  {
    rank: 3,
    score: "2.1",
    code: ["SELECT * FROM users WHERE 1=1", "-- TODO: add authentication"],
    lang: "sql",
    rankColor: "text-text-secondary",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center px-10">
      {/* ── Hero + editor ── */}
      <div className="flex flex-col gap-8 w-[780px] pt-20">
        {/* Hero title */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[36px] font-bold text-accent-green leading-none">
              $
            </span>
            <span className="font-mono text-[36px] font-bold text-text-primary leading-none">
              paste your code. get roasted.
            </span>
          </div>
          <p
            className="text-[14px] text-text-secondary leading-relaxed"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            {
              "// drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </p>
        </div>

        {/* Code editor (client) + actions bar */}
        <CodeInput defaultCode={SAMPLE_CODE} />

        {/* Footer hint */}
        <p
          className="text-center text-[12px] text-text-tertiary"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          2,847 codes roasted · avg score: 4.2/10
        </p>
      </div>

      {/* ── Leaderboard preview ── */}
      <div className="flex flex-col gap-6 w-[960px] mt-20">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[14px] font-bold text-accent-green">
              {"//"}
            </span>
            <span className="font-mono text-[14px] font-bold text-text-primary">
              shame_leaderboard
            </span>
          </div>
          <button
            type="button"
            className="font-mono text-[12px] text-text-secondary border border-border-primary px-3 py-1.5 hover:text-text-primary transition-colors cursor-pointer bg-transparent"
          >
            $ view_all &gt;&gt;
          </button>
        </div>

        {/* Subtitle */}
        <p
          className="text-[13px] text-text-tertiary -mt-4"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          {"// the worst code on the internet, ranked by shame"}
        </p>

        {/* Table */}
        <div className="border border-border-primary overflow-hidden">
          {/* Table header */}
          <div className="flex items-center h-10 bg-bg-surface border-b border-border-primary px-5 gap-4">
            <span className="w-[50px] font-mono text-[12px] font-medium text-text-tertiary">
              #
            </span>
            <span className="w-[70px] font-mono text-[12px] font-medium text-text-tertiary">
              score
            </span>
            <span className="flex-1 font-mono text-[12px] font-medium text-text-tertiary">
              code
            </span>
            <span className="w-[100px] font-mono text-[12px] font-medium text-text-tertiary">
              lang
            </span>
          </div>

          {/* Table rows */}
          {LEADERBOARD_ROWS.map((row, i) => (
            <div
              key={row.rank}
              className={`flex items-start px-5 py-4 gap-4 ${i < LEADERBOARD_ROWS.length - 1 ? "border-b border-border-primary" : ""}`}
            >
              <span
                className={`w-[50px] font-mono text-[13px] font-medium ${row.rankColor}`}
              >
                {row.rank}
              </span>
              <span className="w-[70px] font-mono text-[13px] font-bold text-accent-red">
                {row.score}
              </span>
              <div className="flex-1 flex flex-col gap-1">
                {row.code.map((line) => (
                  <span
                    key={line}
                    className={`font-mono text-[13px] ${line.startsWith("//") || line.startsWith("--") ? "text-text-tertiary" : "text-text-primary"}`}
                  >
                    {line}
                  </span>
                ))}
              </div>
              <span className="w-[100px] font-mono text-[12px] text-text-secondary">
                {row.lang}
              </span>
            </div>
          ))}
        </div>

        {/* Fade hint */}
        <p
          className="text-center text-[12px] text-text-tertiary"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          showing top 3 of 2,847 ·{" "}
          <a
            href="/leaderboard"
            className="hover:text-text-secondary transition-colors"
          >
            view full leaderboard &gt;&gt;
          </a>
        </p>
      </div>

      {/* Bottom spacer */}
      <div className="h-16" />
    </main>
  );
}
