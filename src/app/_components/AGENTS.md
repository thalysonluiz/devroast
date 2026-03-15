# AGENTS.md — src/app/_components/

App-level components used by routes under `src/app/`. These are **not** reusable UI primitives
(those live in `src/components/ui/`).

## General rules

- Named exports only — no `default export`.
- Server Components by default. Add `"use client"` only when the component requires
  interactivity, browser APIs, or React hooks (`useState`, `useEffect`, etc.).
- Pass Server Components as `children` into Client Components to keep them server-side
  (avoids unnecessary client bundles).

## Server + Client split pattern

When a component needs both server data and client-side animation/interactivity,
split it into two files:

| File | Directive | Responsibility |
|---|---|---|
| `<feature>.tsx` | _(none — Server Component)_ | Fetch data, pass as props |
| `<feature>-numbers.tsx` | `"use client"` | Receive props, animate/interact |
| `<feature>-skeleton.tsx` | _(none)_ | Static loading placeholder for Suspense |

Example: `metrics.tsx` → `metrics-numbers.tsx` + `metrics-skeleton.tsx`.

## Animated numbers with @number-flow/react

Use `NumberFlow` from `@number-flow/react` for any numeric value that should animate
when it changes. The component is client-only.

**Pattern — animate from 0 to real value on mount:**

```tsx
"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

export function MyNumbers({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return <NumberFlow value={display} />;
}
```

- Initialize state at `0`.
- Set the real value inside `useEffect` — this fires after hydration and triggers
  the NumberFlow animation from 0 to the real value.
- Do **not** pass the real value directly as the initial state; that skips the animation.

## Suspense + skeleton pattern

Wrap async Server Components in `<Suspense>` with a skeleton fallback.
The skeleton should match the layout and font of the real component to avoid layout shift.

```tsx
import { Suspense } from "react";
import { MetricsDisplay } from "./_components/metrics";
import { MetricsSkeleton } from "./_components/metrics-skeleton";

<Suspense fallback={<MetricsSkeleton />}>
  <MetricsDisplay />
</Suspense>
```

Use `animate-pulse` and `bg-bg-surface` for skeleton placeholder elements.
Match `font-family`, `text-[size]`, and `text-color` exactly so the transition is seamless.

## tRPC data fetching in Server Components

Use `caller` from `@/trpc/server` for direct server-side calls:

```ts
import { caller } from "@/trpc/server";

export async function MetricsDisplay() {
  const result = await caller.metrics.getMetrics();
  return <MetricsNumbers totalRoasts={result.totalRoasts as number} avgScore={result.avgScore as number} />;
}
```

Cast return values with `as number` / `as string` when the LSP infers `{}` due to the
dual drizzle-orm instance issue (see `src/trpc/AGENTS.md`).
