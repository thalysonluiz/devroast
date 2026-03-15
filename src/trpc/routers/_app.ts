import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { metricsRouter } from "./metrics";

export const appRouter = createTRPCRouter({
  metrics: metricsRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
