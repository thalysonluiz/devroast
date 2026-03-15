import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { metricsRouter } from "./metrics";
import { roastsRouter } from "./roasts";

export const appRouter = createTRPCRouter({
  metrics: metricsRouter,
  leaderboard: leaderboardRouter,
  roasts: roastsRouter,
});

export type AppRouter = typeof appRouter;
