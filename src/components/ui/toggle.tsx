"use client";

import { Switch } from "@base-ui/react/switch";
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
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  name,
  className,
}: ToggleProps) {
  return (
    <div
      className={twMerge(
        "inline-flex items-center gap-3",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <Switch.Root
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
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
            checked ? "text-accent-green" : "text-text-secondary",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
