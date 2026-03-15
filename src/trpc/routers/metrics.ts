import { db, sql } from "@/db";
import { roasts } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const metricsRouter = createTRPCRouter({
  getMetrics: baseProcedure.query(async () => {
    const [result] = await db
      .select({
        totalRoasts: sql<number>`cast(count(${roasts.id}) as integer)`,
        avgScore: sql<
          string | null
        >`cast(avg(${roasts.score}) as numeric(3,1))`,
      })
      .from(roasts);

    return {
      totalRoasts: result?.totalRoasts ?? 0,
      avgScore: result?.avgScore ? Number(result.avgScore) : 0,
    };
  }),
});
