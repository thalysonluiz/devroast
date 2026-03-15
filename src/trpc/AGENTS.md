# AGENTS.md — src/trpc/

Type-safe API layer using tRPC v11 + TanStack Query v5 on Next.js App Router.

## File responsibilities

| File | Role |
|---|---|
| `init.ts` | `initTRPC`, `createTRPCContext`, `baseProcedure`, `createTRPCRouter`, `createCallerFactory` |
| `query-client.ts` | `makeQueryClient` — shared factory for server and browser `QueryClient` |
| `server.tsx` | Server-only: `caller`, `trpc` proxy, `HydrateClient`, `prefetch` |
| `client.tsx` | `"use client"`: `TRPCReactProvider`, `useTRPC` |
| `routers/_app.ts` | `appRouter` + exported `AppRouter` type |
| `routers/*.ts` | One file per domain router |

## Architecture rules

- `server.tsx` is `.tsx` (not `.ts`) because it contains JSX (`HydrationBoundary`).
- Import `server-only` at the top of `server.tsx` and `init.ts` to prevent accidental client usage.
- The browser `QueryClient` is a singleton (`browserQueryClient`) — never recreate it on re-renders.
- `staleTime` is set to `30 * 1000` ms on the `QueryClient` to avoid refetching on hydration.
- `shouldDehydrateQuery` is extended to include `"pending"` queries so prefetched data is sent to the client.

## Adding a new router

1. Create `src/trpc/routers/<domain>.ts` — export a `<domain>Router` using `createTRPCRouter`.
2. Register it in `src/trpc/routers/_app.ts` under `appRouter`.
3. Use `baseProcedure` for all procedures (no auth context yet).

```ts
// src/trpc/routers/example.ts
import { baseProcedure, createTRPCRouter } from "../init";

export const exampleRouter = createTRPCRouter({
  getData: baseProcedure.query(async () => {
    // ...
  }),
});
```

## Calling from Server Components

Use `caller` for direct server-side calls (no HTTP round-trip):

```ts
import { caller } from "@/trpc/server";

const result = await caller.metrics.getMetrics();
```

The return type of `caller` may be incorrectly inferred as `{}` due to the dual drizzle-orm
instance in pnpm (see below). Cast values explicitly with `as number`, `as string`, etc.
`tsc --noEmit` passes clean — these are false-positive LSP errors only.

## Known issue — drizzle-orm dual instance (LSP false positives)

pnpm resolves two instances of `drizzle-orm@0.45.1`:
- `drizzle-orm@0.45.1_@opentelemetry+api@1.9.0_postgres@3.4.8` — runtime
- `drizzle-orm@0.45.1_postgres@3.4.8` — pulled as peer by `drizzle-kit`

This causes LSP errors like:
> "Types have separate declarations of a private property 'shouldInlineParams'"

**Do not attempt to fix these by changing query code.** They are resolved by
`skipLibCheck: true` in `tsconfig.json` and do not affect builds or runtime.
The `pnpm.overrides` in `package.json` pins drizzle-orm to a single instance:

```json
"pnpm": { "overrides": { "drizzle-orm": "$drizzle-orm" } }
```

## API route

The fetch adapter lives at `src/app/api/trpc/[trpc]/route.ts` and handles both `GET` and `POST`.
Do not move or rename this file — the tRPC client is hardcoded to `/api/trpc`.
