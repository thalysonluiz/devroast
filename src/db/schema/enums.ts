import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);

export const verdictEnum = pgEnum("verdict", [
  "clean_code",
  "needs_work",
  "needs_serious_help",
  "what_is_this",
  "unroastable",
]);

export const severityEnum = pgEnum("severity", [
  "critical", // vermelho — problema grave
  "warning", // amarelo — pode melhorar
  "good", // verde — ponto positivo
]);
