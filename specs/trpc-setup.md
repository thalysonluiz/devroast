# Spec: tRPC + TanStack React Query (Next.js App Router)

## Contexto

O devroast precisa de uma camada de API tipada end-to-end para expor operações como submeter código, buscar resultado do roast e listar o leaderboard. O tRPC v11 com a integração `@trpc/tanstack-react-query` é a escolha ideal por:

1. Type-safety total entre server e client sem geração de código
2. Integração nativa com Server Components via `createTRPCOptionsProxy` + prefetch
3. `@tanstack/react-query` já será necessário para gerenciar estado assíncrono nos Client Components
4. Substitui Route Handlers ad-hoc — toda a lógica de API fica centralizada em `src/trpc/`

---

## Arquitetura da solução

### Divisão de arquivos

```
src/trpc/
  init.ts          ← initTRPC, contexto, exports de base (server-only)
  query-client.ts  ← makeQueryClient (compartilhado server/client)
  routers/
    _app.ts        ← appRouter principal, re-exporta AppRouter type
    submissions.ts ← procedures de submissão + roast
    leaderboard.ts ← procedure de leaderboard
  server.ts        ← trpc proxy p/ Server Components, getQueryClient, HydrateClient, prefetch (server-only)
  client.tsx       ← TRPCReactProvider, useTRPC, TRPCProvider ("use client")

app/api/trpc/[trpc]/
  route.ts         ← fetch adapter (GET + POST)
```

### Fluxo de dados

```
Server Component
  prefetch(trpc.submissions.get.queryOptions(...))
  └─ HydrateClient → dehydrate(queryClient) → stream para o browser

Client Component
  const trpc = useTRPC()
  useQuery(trpc.submissions.get.queryOptions(...))
  └─ dados já disponíveis no cache (sem loading flash)
```

---

## Detalhamento dos arquivos

### `src/trpc/init.ts`

```ts
import 'server-only';
import { initTRPC } from '@trpc/server';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  // Adicionar headers/auth aqui quando necessário
  return {};
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

### `src/trpc/query-client.ts`

```ts
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30 * 1000 },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}
```

> `shouldDehydrateQuery` estendido para incluir queries `pending` — necessário para o padrão de prefetch com streaming do App Router.

### `src/trpc/server.ts`

```ts
import 'server-only';
import { createTRPCOptionsProxy, TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Caller direto para Server Components que não precisam hidratar o client
export const caller = appRouter.createCaller(createTRPCContext);

// Helpers para reduzir boilerplate nas pages
export function HydrateClient(props: { children: React.ReactNode }) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
  const qc = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void qc.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void qc.prefetchQuery(queryOptions);
  }
}
```

### `src/trpc/client.tsx`

```tsx
'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from './routers/_app';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: typeof window !== 'undefined'
            ? '/api/trpc'
            : `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/trpc`,
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
```

### `app/api/trpc/[trpc]/route.ts`

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '@/trpc/init';
import { appRouter } from '@/trpc/routers/_app';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
```

---

## Uso em Server Components

```tsx
// app/page.tsx
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { RoastResult } from './_components/roast-result';

export default async function Home() {
  prefetch(trpc.leaderboard.list.queryOptions());
  return (
    <HydrateClient>
      <RoastResult />
    </HydrateClient>
  );
}
```

## Uso em Client Components

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

export function RoastResult() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.leaderboard.list.queryOptions());
  // ...
}
```

---

## Dependências

| Pacote | Papel |
|---|---|
| `@trpc/server` | Core do servidor, `initTRPC`, adapters |
| `@trpc/client` | Cliente HTTP, `httpBatchLink` |
| `@trpc/tanstack-react-query` | Integração com React Query (`createTRPCContext`, `createTRPCOptionsProxy`) |
| `@tanstack/react-query` | Gerenciamento de estado assíncrono no cliente |
| `zod` | Validação de input nas procedures |
| `server-only` | Impede importação acidental de arquivos server em Client Components |
| `client-only` | Impede importação acidental de arquivos client em Server Components |

```bash
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod server-only client-only
```

---

## To-dos de implementação

- [ ] Instalar dependências
- [ ] Criar `src/trpc/init.ts` com `initTRPC`, `createTRPCContext`, exports de base
- [ ] Criar `src/trpc/query-client.ts` com `makeQueryClient`
- [ ] Criar `src/trpc/routers/submissions.ts` com procedures de submissão e roast
- [ ] Criar `src/trpc/routers/leaderboard.ts` com procedure de listagem
- [ ] Criar `src/trpc/routers/_app.ts` com `appRouter` e exportar `AppRouter` type
- [ ] Criar `src/trpc/server.ts` com `trpc`, `caller`, `HydrateClient`, `prefetch`, `getQueryClient`
- [ ] Criar `src/trpc/client.tsx` com `TRPCReactProvider` e exportar `useTRPC`
- [ ] Criar `app/api/trpc/[trpc]/route.ts` com o fetch adapter
- [ ] Adicionar `TRPCReactProvider` no `app/layout.tsx` envolvendo o conteúdo da página
- [ ] Migrar lógica de Server Actions / Route Handlers existentes para procedures tRPC
