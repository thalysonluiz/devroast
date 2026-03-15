import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { severityEnum, verdictEnum } from "./enums";
import { submissions } from "./submissions";

export const roasts = pgTable("roasts", {
  id: uuid().primaryKey().defaultRandom(),
  submissionId: uuid()
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  score: numeric({ precision: 3, scale: 1 }).notNull(),
  verdict: verdictEnum().notNull(),
  roastQuote: text().notNull(),
  suggestedFix: text(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const roastIssues = pgTable("roast_issues", {
  id: uuid().primaryKey().defaultRandom(),
  roastId: uuid()
    .notNull()
    .references(() => roasts.id, { onDelete: "cascade" }),
  severity: severityEnum().notNull(),
  title: varchar({ length: 120 }).notNull(),
  description: text().notNull(),
  order: integer().notNull(),
});
