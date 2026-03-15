"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki";
import { SUPPORTED_LANGS } from "./code-editor";

const LANG_LABELS: Record<BundledLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  tsx: "TSX",
  jsx: "JSX",
  python: "Python",
  go: "Go",
  rust: "Rust",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  sql: "SQL",
  bash: "Bash",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  markdown: "Markdown",
} as Record<BundledLanguage, string>;

type LanguageSelectorProps = {
  value: BundledLanguage | null; // null = auto
  detectedLanguage: BundledLanguage | null;
  onChange: (lang: BundledLanguage | null) => void;
};

export function LanguageSelector({
  value,
  detectedLanguage,
  onChange,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const label =
    value !== null
      ? (LANG_LABELS[value] ?? value)
      : detectedLanguage
        ? `Auto (${LANG_LABELS[detectedLanguage] ?? detectedLanguage})`
        : "Auto";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-mono text-[11px] text-text-tertiary hover:text-text-secondary transition-colors px-2 py-1 border border-transparent hover:border-border-primary"
      >
        {label}
        <ChevronDown size={12} className="shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-bg-surface border border-border-primary min-w-[160px] max-h-[240px] overflow-y-auto">
          {/* Auto option */}
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-1.5 font-mono text-[12px] hover:bg-bg-elevated transition-colors ${value === null ? "text-accent-green" : "text-text-secondary"}`}
          >
            Auto-detect
          </button>

          <div className="border-t border-border-primary my-1" />

          {SUPPORTED_LANGS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 font-mono text-[12px] hover:bg-bg-elevated transition-colors ${value === lang ? "text-accent-green" : "text-text-secondary"}`}
            >
              {LANG_LABELS[lang] ?? lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
