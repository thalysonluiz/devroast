"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { CodeEditor } from "./code-editor";
import { LanguageSelector } from "./language-selector";

type CodeInputProps = {
  defaultCode: string;
};

export function CodeInput({ defaultCode }: CodeInputProps) {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState<BundledLanguage | null>(null);
  const [detectedLanguage, setDetectedLanguage] =
    useState<BundledLanguage | null>(null);
  const [roastMode, setRoastMode] = useState(true);
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

  // Detect on initial load
  useEffect(() => {
    detectLanguage(defaultCode);
  }, [defaultCode, detectLanguage]);

  const handleChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      detectLanguage(newCode);
    },
    [detectLanguage],
  );

  const lineCount = code ? code.split("\n").length : 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Editor */}
      <div className="w-[780px] border border-border-primary bg-bg-input overflow-hidden">
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
        <div className="flex flex-row min-h-[320px]">
          {/* Line numbers — dynamic */}
          <div className="w-12 flex-shrink-0 bg-bg-surface border-r border-border-primary px-3 py-4 flex flex-col select-none">
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
      </div>

      {/* Actions bar */}
      <div className="w-[780px] flex items-center justify-between">
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
        <Button variant="primary" size="md">
          $ roast_my_code
        </Button>
      </div>
    </div>
  );
}
