"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { roastIssues, roasts, submissions } from "@/db/schema";

// ── Input validation ──────────────────────────────────────────────────────────

const inputSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(5000, "Code exceeds 5000 characters"),
  language: z.string().nullable(),
  roastMode: z.boolean(),
});

// ── AI response schema ────────────────────────────────────────────────────────

const roastResponseSchema = z.object({
  language: z
    .string()
    .describe("The detected programming language of the submitted code"),
  score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "Code quality score from 0 (worst) to 10 (best), one decimal place",
    ),
  verdict: z
    .enum([
      "clean_code",
      "needs_work",
      "needs_serious_help",
      "what_is_this",
      "unroastable",
    ])
    .describe("Overall verdict on the code quality"),
  roastQuote: z
    .string()
    .describe(
      "A single punchy quote summarizing the code quality (with quotes around it)",
    ),
  issues: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "good"]),
        title: z
          .string()
          .max(120)
          .describe("Short title for the issue or positive point"),
        description: z
          .string()
          .describe("Detailed explanation of the issue or what is done well"),
        order: z.number().int().min(0),
      }),
    )
    .min(2)
    .max(6)
    .describe("List of issues found and positive points (mix of severities)"),
  suggestedFix: z
    .array(
      z.object({
        type: z.enum(["context", "removed", "added"]),
        code: z
          .string()
          .describe("The exact line of code (without leading +/- prefix)"),
      }),
    )
    .nullable()
    .describe(
      "A unified diff showing one key improvement as an ordered list of lines with their type. Use 'context' for unchanged surrounding lines, 'removed' for deleted lines, 'added' for new lines. Return null if code is already clean or the fix is not applicable.",
    ),
});

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildPrompt(code: string, roastMode: boolean): string {
  const modeInstructions = roastMode
    ? `Você é um desenvolvedor sênior brutalmente sarcástico e sem tolerância para código ruim.
Faça um roast impiedoso deste código. Seja engraçado, cruel e específico. Use humor de desenvolvedor.
O roastQuote deve ser uma frase de efeito devastadora que capture a essência dos problemas do código.
Para o verdict, prefira as opções mais duras a menos que o código seja genuinamente excelente.`
    : `Você é um desenvolvedor sênior experiente fazendo uma revisão técnica objetiva do código.
Seja direto, honesto e construtivo. Foque em problemas reais e pontos fortes genuínos.
O roastQuote deve ser um resumo conciso e honesto da qualidade do código.
Para o verdict, seja justo e preciso com base na qualidade real do código.`;

  return `${modeInstructions}

Analise o código a seguir e retorne uma resposta JSON estruturada:

\`\`\`
${code}
\`\`\`

Regras:
- Detecte a linguagem de programação automaticamente
- O score deve ser de 0 a 10 com uma casa decimal (ex: 3.5, 7.0)
- O roastQuote deve estar entre aspas duplas (ex: "seu código parece...")
- Todos os textos voltados ao usuário (roastQuote, title e description das issues) devem estar em português do Brasil
- Inclua de 2 a 6 issues: misture critical/warning para problemas e good para pontos positivos
- suggestedFix deve ser um diff intercalado: use "context" para linhas de contexto (inalteradas ao redor da mudança), "removed" para linhas removidas e "added" para linhas adicionadas — na ordem correta em que aparecem no código
- As linhas de "context" devem ser do código original para dar contexto à mudança
- Se não houver correção óbvia (código perfeito ou incompreensível), defina suggestedFix como null
- O campo order começa em 0 e incrementa 1 para cada issue`;
}

// ── Server Action ─────────────────────────────────────────────────────────────

export type RoastActionResult =
  | { success: true; roastId: string }
  | { success: false; error: string };

export async function createRoast(input: {
  code: string;
  language: string | null;
  roastMode: boolean;
}): Promise<RoastActionResult> {
  // 1. Validate input
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { code, roastMode } = parsed.data;

  try {
    // 2. Call AI
    const { object: aiResult } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: roastResponseSchema,
      prompt: buildPrompt(code, roastMode),
    });

    // 3. Serialize suggestedFix diff lines to string for DB storage
    // Format: "<type>|<code>" per line, e.g. "removed|var x = 1;"
    let suggestedFixText: string | null = null;
    if (aiResult.suggestedFix) {
      suggestedFixText = aiResult.suggestedFix
        .map((line) => `${line.type}|${line.code}`)
        .join("\n");
    }

    // 4. Persist to DB in a transaction
    const lineCount = code.split("\n").length;
    const detectedLang = (aiResult.language || "unknown").toLowerCase();

    const roastId = await db.transaction(async (tx) => {
      // Insert submission
      const [submission] = await tx
        .insert(submissions)
        .values({
          code,
          language: detectedLang,
          lineCount,
          roastMode: roastMode ? "roast" : "honest",
        })
        .returning({ id: submissions.id });

      if (!submission) throw new Error("Failed to insert submission");

      // Insert roast
      const [roast] = await tx
        .insert(roasts)
        .values({
          submissionId: submission.id,
          score: aiResult.score.toFixed(1),
          verdict: aiResult.verdict,
          roastQuote: aiResult.roastQuote,
          suggestedFix: suggestedFixText,
        })
        .returning({ id: roasts.id });

      if (!roast) throw new Error("Failed to insert roast");

      // Insert issues
      if (aiResult.issues.length > 0) {
        await tx.insert(roastIssues).values(
          aiResult.issues.map((issue) => ({
            roastId: roast.id,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            order: issue.order,
          })),
        );
      }

      return roast.id;
    });

    return { success: true, roastId };
  } catch (err) {
    console.error("[createRoast] error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate roast",
    };
  }
}
