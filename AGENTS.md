# AGENTS.md — devroast

## Project

**devroast** — users paste code and receive a brutal AI-powered "roast" (score + commentary). Built during Rocketseat NLW with Next.js App Router.

## Stack

- **Next.js 16** (App Router, Turbopack) — TypeScript
- **Tailwind CSS v4** — tokens defined via `@theme` in `src/app/globals.css`
- **tailwind-variants** (`tv`) for component variants; **tailwind-merge** (`twMerge`) for simple merges
- **@base-ui/react** — headless primitives (e.g. Toggle/Switch)
- **shiki** — server-side syntax highlighting in `CodeBlock`
- **tRPC v11** + **TanStack Query v5** — type-safe API layer; see `src/trpc/AGENTS.md`
- **Drizzle ORM** over **postgres** — see `src/db/AGENTS.md`
- **@number-flow/react** — animated number transitions in Client Components

## Project structure

```
src/
  app/
    _components/   # app-level components (Navbar, CodeInput, metrics…)
                   # see src/app/_components/AGENTS.md
    globals.css    # @theme design tokens
    layout.tsx     # root layout (Navbar + TRPCReactProvider live here)
    page.tsx       # homepage
    api/
      trpc/[trpc]/ # tRPC fetch adapter (GET + POST)
  components/
    ui/            # reusable UI primitives
      AGENTS.md    # UI component rules (read before adding components)
  db/
    AGENTS.md      # Drizzle ORM rules
    index.ts       # db client + re-exports sql
    schema/        # table definitions
    migrations/    # drizzle-kit generated SQL
  trpc/
    AGENTS.md      # tRPC architecture rules
    init.ts        # initTRPC, baseProcedure, createTRPCRouter
    query-client.ts
    client.tsx     # TRPCReactProvider, useTRPC ("use client")
    server.tsx     # caller, trpc proxy, HydrateClient (server-only)
    routers/
      _app.ts      # appRouter + AppRouter type
```

## Design tokens (key)

| Token | Value |
|---|---|
| `bg-page` | `#0A0A0A` |
| `bg-surface` | `#0F0F0F` |
| `bg-input` | `#111111` |
| `text-primary` | `#FAFAFA` |
| `text-secondary` | `#6B7280` |
| `text-tertiary` | `#4B5563` |
| `border-primary` | `#2A2A2A` |
| `accent-green` | `#10B981` |
| `accent-red` | `#EF4444` |
| `accent-amber` | `#F59E0B` |

Fonts: `JetBrains Mono` (global mono), `IBM Plex Mono` (secondary, applied inline where needed).

## Global rules

- **No `default export`** on UI components — named exports only
- Server Components by default; add `"use client"` only when required (interactivity, hooks)
- Pass Server Components as `children` into Client Components to keep them on the server (e.g. `CodeBlock` inside `CodeInput`)
- All UI components must follow `src/components/ui/AGENTS.md`
- Linter: Biome — run `npx biome check` before committing
