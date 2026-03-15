"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";
import { createRoast } from "@/app/actions/roast";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { CodeEditor } from "./code-editor";
import { LanguageSelector } from "./language-selector";

const CODE_MAX_CHARS = 5_000;

type CodeInputProps = {
  defaultCode?: string;
};

export function CodeInput({ defaultCode = "" }: CodeInputProps) {
  const router = useRouter();
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState<BundledLanguage | null>(null);
  const [detectedLanguage, setDetectedLanguage] =
    useState<BundledLanguage | null>(null);
  const [roastMode, setRoastMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-detect language via highlight.js (debounced 300ms)
  const detectLanguage = useCallback((input: string) => {
    if (detectTimerRef.current) clearTimeout(detectTimerRef.current);
    detectTimerRef.current = setTimeout(async () => {
      if (!input.trim()) return;
      const hljs = (await import("highlight.js")).default;
      const result = hljs.highlightAuto(input);
      if (result.language) {
        setDetectedLanguage(result.language as BundledLanguage);
      }
    }, 300);
  }, []);

  // Detect on initial load if defaultCode was provided
  useEffect(() => {
    if (defaultCode) detectLanguage(defaultCode);
  }, [defaultCode, detectLanguage]);

  const handleChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      detectLanguage(newCode);
    },
    [detectLanguage],
  );

  const lineCount = code ? code.split("\n").length : 1;
  const charCount = code.length;
  const isOverLimit = charCount > CODE_MAX_CHARS;

  const handleSubmit = useCallback(async () => {
    if (!code.trim() || isOverLimit || isLoading) return;
    setIsLoading(true);
    setError(null);
    const result = await createRoast({
      code,
      language: language ?? detectedLanguage,
      roastMode,
    });
    if (result.success) {
      router.push(`/roast/${result.roastId}`);
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  }, [
    code,
    language,
    detectedLanguage,
    roastMode,
    isOverLimit,
    isLoading,
    router,
  ]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Editor */}
      <div className="w-full border border-border-primary bg-bg-input overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 h-10 border-b border-border-primary bg-bg-surface">
          <span className="w-3 h-3 rounded-full bg-accent-red shrink-0" />
          <span className="w-3 h-3 rounded-full bg-accent-amber shrink-0" />
          <span className="w-3 h-3 rounded-full bg-accent-green shrink-0" />
          <div className="flex-1" />
          <LanguageSelector
            value={language}
            detectedLanguage={detectedLanguage}
            onChange={setLanguage}
          />
        </div>

        {/* Editor body: line numbers + code editor */}
        <div className="flex flex-row min-h-[320px] max-h-[520px] overflow-y-auto">
          {/* Line numbers — dynamic, scrolls with the editor */}
          <div className="w-12 flex-shrink-0 bg-bg-surface border-r border-border-primary px-3 py-4 flex flex-col select-none sticky left-0">
            {Array.from({ length: lineCount }, (_, i) => i + 1).map((n) => (
              <span
                key={n}
                className="font-mono text-[12px] text-text-tertiary leading-relaxed"
              >
                {n}
              </span>
            ))}
          </div>

          {/* Code editor (textarea + overlay) */}
          <CodeEditor
            value={code}
            onChange={handleChange}
            language={language}
            detectedLanguage={detectedLanguage}
            className="flex-1"
          />
        </div>

        {/* Character counter — bottom-right of the editor */}
        <div className="flex justify-end px-4 py-1.5 border-t border-border-primary bg-bg-surface">
          <span
            className={`font-mono text-[11px] tabular-nums transition-colors ${
              isOverLimit
                ? "text-accent-red"
                : charCount > CODE_MAX_CHARS * 0.9
                  ? "text-accent-amber"
                  : "text-text-tertiary"
            }`}
          >
            {charCount.toLocaleString("en-US")} /{" "}
            {CODE_MAX_CHARS.toLocaleString("en-US")}
          </span>
        </div>
      </div>

      {/* Actions bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            onCheckedChange={setRoastMode}
            label="roast mode"
          />
          <span
            className="font-mono text-[12px] text-text-tertiary"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            {"// maximum sarcasm enabled"}
          </span>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <Button
            variant="primary"
            size="md"
            className="sm:w-auto w-full"
            disabled={!code.trim() || isOverLimit || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "$ roasting..." : "$ roast_my_code"}
          </Button>
          {error && (
            <span className="font-mono text-[11px] text-accent-red">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
