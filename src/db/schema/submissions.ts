import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { roastModeEnum } from "./enums";

export const submissions = pgTable("submissions", {
  id: uuid().primaryKey().defaultRandom(),
  code: text().notNull(),
  language: varchar({ length: 50 }).notNull(),
  lineCount: integer().notNull(),
  roastMode: roastModeEnum().notNull().default("roast"),
  createdAt: timestamp().notNull().defaultNow(),
});
