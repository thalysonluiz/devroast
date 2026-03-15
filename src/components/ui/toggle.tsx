"use client";

import { Switch } from "@base-ui/react/switch";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type ToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
};

export function Toggle({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled,
  name,
  className,
}: ToggleProps) {
  // Mirror the switch state locally so the label color always matches,
  // regardless of whether the component is controlled or uncontrolled.
  // This also eliminates the hydration mismatch caused by reading the raw
  // `checked` prop before @base-ui has initialised its internal state.
  const [internalChecked, setInternalChecked] = useState(
    controlledChecked ?? defaultChecked,
  );

  const isChecked =
    controlledChecked !== undefined ? controlledChecked : internalChecked;

  function handleCheckedChange(next: boolean) {
    setInternalChecked(next);
    onCheckedChange?.(next);
  }

  return (
    <div
      className={twMerge(
        "inline-flex items-center gap-3",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <Switch.Root
        checked={controlledChecked}
        defaultChecked={defaultChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        name={name}
        aria-label={label}
        className={(state) =>
          twMerge(
            "relative inline-flex items-center w-10 h-[22px] rounded-full p-[3px] transition-colors cursor-pointer",
            state.checked ? "bg-accent-green" : "bg-border-primary",
          )
        }
      >
        <Switch.Thumb
          className={(state) =>
            twMerge(
              "block w-4 h-4 rounded-full transition-all duration-150",
              state.checked
                ? "bg-bg-page translate-x-[18px]"
                : "bg-text-secondary translate-x-0",
            )
          }
        />
      </Switch.Root>

      {label && (
        <span
          className={twMerge(
            "font-mono text-xs transition-colors select-none",
            isChecked ? "text-accent-green" : "text-text-secondary",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
