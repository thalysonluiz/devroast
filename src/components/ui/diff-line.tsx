import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const diffLine = tv({
  base: "flex items-baseline gap-2 px-4 py-2 font-mono text-[13px] w-full",
  variants: {
    variant: {
      removed: "bg-[#1A0A0A]",
      added: "bg-[#0A1A0F]",
      context: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "context",
  },
});

const prefixColor: Record<string, string> = {
  removed: "text-accent-red",
  added: "text-accent-green",
  context: "text-text-tertiary",
};

const codeColor: Record<string, string> = {
  removed: "text-text-secondary",
  added: "text-text-primary",
  context: "text-text-secondary",
};

const prefixSymbol: Record<string, string> = {
  removed: "-",
  added: "+",
  context: " ",
};

type DiffLineVariants = VariantProps<typeof diffLine>;

type DiffLineProps = ComponentProps<"div"> &
  DiffLineVariants & {
    code: string;
  };

export function DiffLine({
  variant = "context",
  code,
  className,
  ...props
}: DiffLineProps) {
  const v = variant ?? "context";
  return (
    <div className={diffLine({ variant, className })} {...props}>
      <span className={prefixColor[v]}>{prefixSymbol[v]}</span>
      <span className={codeColor[v]}>{code}</span>
    </div>
  );
}
