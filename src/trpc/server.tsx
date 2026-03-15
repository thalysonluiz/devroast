import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export const caller = createCallerFactory(appRouter)(createTRPCContext);

export function HydrateClient(props: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {props.children}
    </HydrationBoundary>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: tRPC query options can be any query shape
export function prefetch(queryOptions: any) {
  const qc = getQueryClient();
  if (queryOptions?.queryKey?.[1]?.type === "infinite") {
    void qc.prefetchInfiniteQuery(queryOptions);
  } else {
    void qc.prefetchQuery(queryOptions);
  }
}
