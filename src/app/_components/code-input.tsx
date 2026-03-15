"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const LINE_NUMBERS = Array.from({ length: 16 }, (_, i) => i + 1);

type CodeInputProps = {
  children: React.ReactNode;
  defaultCode: string;
};

export function CodeInput({ children, defaultCode }: CodeInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [roastMode, setRoastMode] = useState(true);
  const [code, setCode] = useState(defaultCode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="flex flex-col gap-4">
      {/* Editor */}
      <div className="w-[780px] border border-border-primary bg-bg-input overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 h-10 border-b border-border-primary bg-bg-surface">
          <span className="w-3 h-3 rounded-full bg-accent-red" />
          <span className="w-3 h-3 rounded-full bg-accent-amber" />
          <span className="w-3 h-3 rounded-full bg-accent-green" />
        </div>

        {/* Editor body — flex row, line numbers + content */}
        <div className="flex flex-row h-[320px]">
          {/* Line numbers */}
          <div className="w-12 flex-shrink-0 bg-bg-surface border-r border-border-primary px-3 py-4 flex flex-col gap-2 select-none">
            {LINE_NUMBERS.map((n) => (
              <span
                key={n}
                className="font-mono text-[12px] text-text-tertiary leading-relaxed"
              >
                {n}
              </span>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-auto h-full">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onBlur={() => setIsEditing(false)}
                className="w-full h-full p-4 bg-transparent text-text-primary font-mono text-[13px] leading-relaxed resize-none outline-none cursor-text"
                spellCheck={false}
              />
            ) : (
              <button
                type="button"
                className="w-full h-full text-left cursor-text bg-transparent border-0 p-0 overflow-auto"
                onClick={() => setIsEditing(true)}
              >
                {children}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="w-[780px] flex items-center justify-between">
        {/* Left: toggle + comment */}
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

        {/* Right: submit button */}
        <Button variant="primary" size="md">
          $ roast_my_code
        </Button>
      </div>
    </div>
  );
}
