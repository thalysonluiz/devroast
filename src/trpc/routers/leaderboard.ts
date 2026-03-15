import { asc, db, eq } from "@/db";
import { roasts, submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
  getTopShame: baseProcedure.query(async () => {
    const rows = await db
      .select({
        id: roasts.id,
        score: roasts.score,
        roastQuote: roasts.roastQuote,
        language: submissions.language,
        code: submissions.code,
      })
      .from(roasts)
      .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
      .orderBy(asc(roasts.score))
      .limit(3);

    return rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      score: Number(row.score),
      roastQuote: row.roastQuote,
      language: row.language,
      code: row.code,
      lineCount: row.code.split("\n").length,
    }));
  }),
});
