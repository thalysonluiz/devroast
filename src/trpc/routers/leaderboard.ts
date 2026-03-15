import { asc, db, eq } from "@/db";
import { roasts, submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

const selectShameRows = () =>
  db
    .select({
      id: roasts.id,
      score: roasts.score,
      roastQuote: roasts.roastQuote,
      language: submissions.language,
      code: submissions.code,
    })
    .from(roasts)
    .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
    .orderBy(asc(roasts.score));

const mapRow = (
  row: Awaited<ReturnType<typeof selectShameRows>>[number],
  index: number,
) => ({
  rank: index + 1,
  id: row.id,
  score: Number(row.score),
  roastQuote: row.roastQuote,
  language: row.language,
  code: row.code,
  lineCount: row.code.split("\n").length,
});

export const leaderboardRouter = createTRPCRouter({
  getTopShame: baseProcedure.query(async () => {
    const rows = await selectShameRows().limit(3);
    return rows.map(mapRow);
  }),

  getShameLeaderboard: baseProcedure.query(async () => {
    const rows = await selectShameRows().limit(20);
    return rows.map(mapRow);
  }),
});
