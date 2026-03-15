import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { asc, db, eq } from "@/db";
import { roastIssues, roasts, submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const roastsRouter = createTRPCRouter({
  getRoastById: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      // Fetch roast + submission in one join
      const [row] = await db
        .select({
          roastId: roasts.id,
          score: roasts.score,
          verdict: roasts.verdict,
          roastQuote: roasts.roastQuote,
          suggestedFix: roasts.suggestedFix,
          roastCreatedAt: roasts.createdAt,
          submissionId: submissions.id,
          code: submissions.code,
          language: submissions.language,
          lineCount: submissions.lineCount,
          roastMode: submissions.roastMode,
        })
        .from(roasts)
        .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
        .where(eq(roasts.id, input.id))
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Roast not found" });
      }

      // Fetch issues ordered by their stored order
      const issues = await db
        .select({
          id: roastIssues.id,
          severity: roastIssues.severity,
          title: roastIssues.title,
          description: roastIssues.description,
          order: roastIssues.order,
        })
        .from(roastIssues)
        .where(eq(roastIssues.roastId, row.roastId))
        .orderBy(asc(roastIssues.order));

      return {
        id: row.roastId as string,
        score: Number(row.score) as number,
        verdict: row.verdict as
          | "clean_code"
          | "needs_work"
          | "needs_serious_help"
          | "what_is_this"
          | "unroastable",
        roastQuote: row.roastQuote as string,
        suggestedFix: row.suggestedFix as string | null,
        createdAt: row.roastCreatedAt as Date,
        submission: {
          id: row.submissionId as string,
          code: row.code as string,
          language: row.language as string,
          lineCount: row.lineCount as number,
          roastMode: row.roastMode as "honest" | "roast",
        },
        issues: issues.map((issue) => ({
          id: issue.id as string,
          severity: issue.severity as "critical" | "warning" | "good",
          title: issue.title as string,
          description: issue.description as string,
          order: issue.order as number,
        })),
      };
    }),
});
