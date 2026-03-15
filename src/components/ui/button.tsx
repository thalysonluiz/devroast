import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const button = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-mono text-[13px] font-medium",
    "transition-colors cursor-pointer",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  variants: {
    variant: {
      primary: "bg-accent-green text-bg-page hover:bg-accent-green/90",
      secondary:
        "bg-transparent text-accent-green border border-accent-green hover:bg-accent-green/10",
      ghost:
        "bg-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
      danger: "bg-accent-red text-bg-page hover:bg-accent-red/90",
    },
    size: {
      sm: "px-4 py-1.5 text-xs",
      md: "px-6 py-2.5",
      lg: "px-8 py-3 text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ComponentProps<"button"> & ButtonVariants;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button {...props} className={button({ variant, size, className })} />;
}
