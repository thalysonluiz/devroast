import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const badge = tv({
  base: [
    "inline-flex items-center gap-2",
    "font-mono text-xs",
    "before:inline-block before:w-2 before:h-2 before:rounded-full before:shrink-0",
  ],
  variants: {
    variant: {
      critical: "text-accent-red before:bg-accent-red",
      warning: "text-accent-amber before:bg-accent-amber",
      good: "text-accent-green before:bg-accent-green",
      info: "text-accent-cyan before:bg-accent-cyan",
    },
  },
  defaultVariants: {
    variant: "good",
  },
});

type BadgeVariants = VariantProps<typeof badge>;

type BadgeProps = ComponentProps<"span"> & BadgeVariants;

export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span {...props} className={badge({ variant, className })} />;
}
