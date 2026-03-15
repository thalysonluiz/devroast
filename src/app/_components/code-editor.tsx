"use client";

import {
  type KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { BundledLanguage, Highlighter } from "shiki";

// Highlighter singleton — initialized once on the client
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["vesper"],
        langs: [],
      }),
    );
  }
  return highlighterPromise;
}

// Languages we support — loaded lazily on demand
const SUPPORTED_LANGS: BundledLanguage[] = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "python",
  "go",
  "rust",
  "java",
  "kotlin",
  "swift",
  "sql",
  "bash",
  "json",
  "html",
  "css",
  "markdown",
];

async function highlightCode(
  code: string,
  lang: BundledLanguage,
): Promise<string | null> {
  // Only highlight languages we explicitly support — prevents shiki from
  // throwing "Language `xyz` is not included in this bundle" for anything
  // that highlight.js detected but shiki doesn't know about.
  if (!SUPPORTED_LANGS.includes(lang)) return null;

  const highlighter = await getHighlighter();
  const loaded = highlighter.getLoadedLanguages();

  if (!loaded.includes(lang)) {
    await highlighter.loadLanguage(lang);
  }

  return highlighter.codeToHtml(code, { lang, theme: "vesper" });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function plainFallback(code: string): string {
  return `<pre style="margin:0;padding:1rem;background:transparent;color:#fafafa;font-size:13px;line-height:inherit"><code>${escapeHtml(code)}</code></pre>`;
}

// Indent/dedent helpers (same approach as ray.so)
function indentText(text: string) {
  return text
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n");
}

function dedentText(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/^\s\s/, ""))
    .join("\n");
}

function getCurrentLine(textarea: HTMLTextAreaElement) {
  const before = textarea.value.slice(0, textarea.selectionStart);
  const lastNl = before.lastIndexOf("\n");
  return textarea.value.slice(lastNl + 1).split("\n")[0];
}

function handleTab(textarea: HTMLTextAreaElement, shift: boolean) {
  const { value, selectionStart: start, selectionEnd: end } = textarea;
  const before = value.slice(0, start);
  const currentLine = getCurrentLine(textarea);

  if (start === end) {
    if (shift) {
      const lineStart = before.lastIndexOf("\n") + 1;
      textarea.setSelectionRange(lineStart, end);
      document.execCommand(
        "insertText",
        false,
        dedentText(value.slice(lineStart, end)),
      );
    } else {
      document.execCommand("insertText", false, "  ");
    }
  } else {
    const lineStart = before.lastIndexOf("\n") + 1 || 0;
    textarea.setSelectionRange(lineStart, end);
    if (shift) {
      const newText = dedentText(value.slice(lineStart, end));
      document.execCommand("insertText", false, newText);
      textarea.setSelectionRange(
        currentLine.startsWith("  ") ? start - 2 : start,
        (currentLine.startsWith("  ") ? start - 2 : start) + newText.length,
      );
    } else {
      const newText = indentText(value.slice(lineStart, end));
      document.execCommand("insertText", false, newText);
      textarea.setSelectionRange(start + 2, start + 2 + newText.length);
    }
  }
}

function handleEnter(textarea: HTMLTextAreaElement) {
  const currentLine = getCurrentLine(textarea);
  const indentMatch = currentLine.match(/^(\s+)/);
  let indent = indentMatch ? indentMatch[0] : "";
  if (currentLine.match(/([{[:>])$/)) indent += "  ";
  document.execCommand("insertText", false, `\n${indent}`);
}

type CodeEditorProps = {
  value: string;
  onChange: (code: string) => void;
  language: BundledLanguage | null; // null = use detectedLanguage
  detectedLanguage: BundledLanguage | null;
  className?: string;
};

export function CodeEditor({
  value,
  onChange,
  language,
  detectedLanguage,
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const effectiveLang = language ?? detectedLanguage;

  // Re-highlight when code or language changes
  useEffect(() => {
    // Show plain white text immediately — never leave the overlay blank
    setHighlightedHtml(plainFallback(value));

    if (!effectiveLang || !value) return;

    let cancelled = false;
    highlightCode(value, effectiveLang).then((html) => {
      if (!cancelled && html !== null) setHighlightedHtml(html);
    });

    return () => {
      cancelled = true;
    };
  }, [value, effectiveLang]);

  // Sync overlay scroll to match the textarea's own scroll (horizontal only;
  // vertical scroll is handled by the parent container in code-input.tsx)
  const syncScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    (e) => {
      const ta = textareaRef.current;
      if (!ta) return;
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          handleTab(ta, e.shiftKey);
          break;
        case "Enter":
          e.preventDefault();
          handleEnter(ta);
          break;
        case "Escape":
          e.preventDefault();
          ta.blur();
          break;
      }
    },
    [],
  );

  const lineCount = value ? value.split("\n").length : 1;

  return (
    <div
      className={`relative font-mono text-[13px] leading-relaxed${className ? ` ${className}` : ""}`}
    >
      {/* Syntax highlight overlay (read-only, pointer-events disabled) */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ lineHeight: "inherit" }}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is trusted
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />

      {/* Transparent textarea on top */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        rows={Math.max(lineCount, 1)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="relative w-full min-h-full p-4 bg-transparent text-transparent caret-text-primary resize-none outline-none overflow-hidden"
        style={{ lineHeight: "inherit" }}
      />
    </div>
  );
}

export { SUPPORTED_LANGS };
