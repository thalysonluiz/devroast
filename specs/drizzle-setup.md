# Spec: Drizzle ORM + PostgreSQL (Docker Compose)

## Contexto

O devroast recebe submissões de código, gera um "roast" via IA (score + análise + sugestão de melhoria) e exibe um leaderboard público com os piores códigos. Esta spec define o schema do banco de dados, os enums necessários e os passos de implementação para integrar Drizzle ORM com PostgreSQL via Docker Compose.

---

## Análise do design (Pencil)

### Screen 1 — Code Input
- Usuário cola código e escolha linguagem (auto-detect ou manual)
- Toggle de "roast mode" (honesto vs. sarcasmo máximo)
- Botão `$ roast_my_code`

### Screen 2 — Roast Results
Dados exibidos após o roast:
- **Score** numérico (ex: `3.5/10`)
- **Verdict** textual (ex: `needs_serious_help`)
- **Roast quote** — frase principal do roast (ex: _"this code looks like it was written during a power outage..."_)
- **Metadados** — linguagem detectada, nº de linhas
- **Código submetido** (exibido com syntax highlight)
- **Análise detalhada** — grid de cards com `título` + `descrição` por issue (problemas e pontos positivos, cada um com severidade visual)
- **Suggested fix** — diff mostrando `seu_código → improved_code`

### Screen 3 — Shame Leaderboard
Dados exibidos por entry:
- Rank (`#1`, `#2`, ...)
- Score (numérico)
- Trecho do código submetido
- Linguagem
- Nº de linhas
- Até 5 entries na tela (paginação implícita)

---

## Schema do banco

### Enum: `roast_mode`

```ts
export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);
```

| Valor | Descrição |
|---|---|
| `honest` | Feedback técnico direto, sem sarcasmo |
| `roast` | Sarcasmo máximo, tom brutal |

---

### Enum: `verdict`

```ts
export const verdictEnum = pgEnum("verdict", [
  "clean_code",
  "needs_work",
  "needs_serious_help",
  "what_is_this",
  "unroastable",
]);
```

| Valor | Score aproximado | Descrição |
|---|---|---|
| `clean_code` | 8–10 | Código bom, parabéns |
| `needs_work` | 5–7.9 | Problemas moderados |
| `needs_serious_help` | 2.5–4.9 | Problemático |
| `what_is_this` | 0–2.4 | Catástrofe |
| `unroastable` | — | Código tão ruim que não tem conserto |

---

### Enum: `severity`

Usado na tabela `roast_issues` para indicar a gravidade/natureza de cada issue.

```ts
export const severityEnum = pgEnum("severity", [
  "critical", // vermelho — problema grave
  "warning",  // amarelo — pode melhorar
  "good",     // verde — ponto positivo
]);
```

| Valor | Cor | Descrição |
|---|---|---|
| `critical` | vermelho (`accent-red`) | Problema grave que deve ser corrigido |
| `warning` | amarelo (`accent-amber`) | Ponto de atenção, pode melhorar |
| `good` | verde (`accent-green`) | Ponto positivo do código |

---

### Tabela: `submissions`

Cada submissão representa um código enviado pelo usuário para ser roastado.

```ts
export const submissions = pgTable("submissions", {
  id:        uuid().primaryKey().defaultRandom(),
  code:      text().notNull(),
  language:  varchar({ length: 50 }).notNull(),
  lineCount: integer().notNull(),
  roastMode: roastModeEnum().notNull().default("roast"),
  createdAt: timestamp().notNull().defaultNow(),
});
```

> **Nota:** Com `casing: "snake_case"` configurado no `drizzle.config.ts` e no cliente Drizzle, os nomes das colunas SQL são derivados automaticamente do camelCase TypeScript — não é necessário repetir o nome da coluna como string.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | gerado automaticamente |
| `code` | `text` | código bruto submetido pelo usuário |
| `language` | `varchar(50)` | linguagem detectada ou selecionada manualmente |
| `line_count` | `integer` | nº de linhas do código |
| `roast_mode` | `roast_mode` enum | modo escolhido pelo usuário |
| `created_at` | `timestamp` | data/hora da submissão |

---

### Tabela: `roasts`

Resultado gerado pela IA para uma submissão. Relação 1:1 com `submissions`.

```ts
export const roasts = pgTable("roasts", {
  id:           uuid().primaryKey().defaultRandom(),
  submissionId: uuid().notNull().references(() => submissions.id, { onDelete: "cascade" }),
  score:        numeric({ precision: 3, scale: 1 }).notNull(),
  verdict:      verdictEnum().notNull(),
  roastQuote:   text().notNull(),
  suggestedFix: text(),
  createdAt:    timestamp().notNull().defaultNow(),
});
```

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | gerado automaticamente |
| `submission_id` | `uuid` FK → `submissions.id` | cascade delete |
| `score` | `numeric(3,1)` | ex: `3.5`, range `0.0–10.0` |
| `verdict` | `verdict` enum | classificação geral |
| `roast_quote` | `text` | frase principal do roast exibida no hero |
| `suggested_fix` | `text` | código melhorado (diff aplicado) — nullable |
| `created_at` | `timestamp` | data/hora do roast |

---

### Tabela: `roast_issues`

Cards de análise detalhada exibidos na Screen 2 (grid de issues/pontos positivos).

```ts
export const roastIssues = pgTable("roast_issues", {
  id:          uuid().primaryKey().defaultRandom(),
  roastId:     uuid().notNull().references(() => roasts.id, { onDelete: "cascade" }),
  severity:    severityEnum().notNull(),
  title:       varchar({ length: 120 }).notNull(),
  description: text().notNull(),
  order:       integer().notNull(),
});
```

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | |
| `roast_id` | `uuid` FK → `roasts.id` | cascade delete |
| `severity` | `severity` enum | `critical`, `warning` ou `good` |
| `title` | `varchar(120)` | título do card (ex: "using var instead of const/let") |
| `description` | `text` | descrição detalhada |
| `order` | `integer` | ordem de exibição no grid |

---

## Índices

Não criar índices além dos implícitos de PK. PKs e FKs já são indexadas automaticamente pelo PostgreSQL. Índices adicionais apenas se houver necessidade comprovada de performance (ex: queries de leaderboard ordenadas por score — avaliar depois com dados reais).

---

## Queries

**Não usar `drizzle-orm/relations` nem `db.query`.**

Todas as queries devem ser escritas com SQL explícito usando `db.select().from(...).innerJoin(...)` (ou `.leftJoin`, etc.). Isso mantém o código previsível, evita magic do ORM e facilita otimizações futuras.

Exemplo de query para o leaderboard:

```ts
const leaderboard = await db
  .select({
    rank: sql<number>`rank() over (order by ${roasts.score} asc)`,
    score: roasts.score,
    verdict: roasts.verdict,
    language: submissions.language,
    lineCount: submissions.lineCount,
    codePreview: sql<string>`left(${submissions.code}, 200)`,
  })
  .from(roasts)
  .innerJoin(submissions, eq(roasts.submissionId, submissions.id))
  .orderBy(asc(roasts.score))
  .limit(10);
```

---

## Diagrama de relações

```
submissions (1) ──── (1) roasts (1) ──── (N) roast_issues
```

---

## Estrutura de arquivos

```
src/
  db/
    index.ts          ← instância do Drizzle (conexão via DATABASE_URL)
    schema/
      index.ts        ← re-exporta tudo
      enums.ts        ← todos os pgEnum
      submissions.ts  ← tabela submissions
      roasts.ts       ← tabelas roasts + roast_issues
    migrations/       ← gerado pelo drizzle-kit (não editar manualmente)

drizzle.config.ts     ← configuração do drizzle-kit
docker-compose.yml    ← PostgreSQL local
.env.local            ← DATABASE_URL (não commitar)
```

---

## drizzle.config.ts

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## src/db/index.ts

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { casing: "snake_case" });
```

> O `casing: "snake_case"` deve estar tanto no `drizzle.config.ts` quanto no cliente para que a geração de migrations e as queries em runtime usem os mesmos nomes de coluna.

---

## Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: devroast
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**`.env.local`:**
```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## Dependências

| Pacote | Papel |
|---|---|
| `drizzle-orm` | ORM principal |
| `drizzle-kit` | CLI para migrations e introspection |
| `postgres` | Driver PostgreSQL com tipos TypeScript embutidos (sem necessidade de `@types/pg`) |

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

> O pacote `postgres` (aka `postgres.js`) já inclui suas próprias tipagens TypeScript — não é necessário instalar `@types/pg`. Evitar misturar com o pacote `pg` (node-postgres), que exigiria `@types/pg` separado.

---

## To-dos de implementação

- [ ] Adicionar `docker-compose.yml` na raiz do projeto
- [ ] Confirmar que `.env.local` está coberto pelo `.gitignore` (padrão `.env*`)
- [ ] Instalar dependências: `drizzle-orm`, `postgres`, `drizzle-kit`
- [ ] Criar `drizzle.config.ts` com `casing: "snake_case"`
- [ ] Criar `src/db/schema/enums.ts` com `roastModeEnum`, `verdictEnum`, `severityEnum`
- [ ] Criar `src/db/schema/submissions.ts` com tabela `submissions`
- [ ] Criar `src/db/schema/roasts.ts` com tabelas `roasts` e `roast_issues`
- [ ] Criar `src/db/schema/index.ts` re-exportando todo o schema
- [ ] Criar `src/db/index.ts` com `drizzle(client, { casing: "snake_case" })`
- [ ] Rodar `pnpm drizzle-kit generate` para gerar a migration inicial
- [ ] Rodar `pnpm drizzle-kit migrate` (com o Docker rodando) para aplicar
- [ ] Adicionar scripts no `package.json`: `db:generate`, `db:migrate`, `db:studio`
