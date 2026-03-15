import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={twMerge(
        "flex flex-col gap-3 p-5 border border-border-primary",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={twMerge("flex items-center gap-2", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={twMerge("font-mono text-[13px] text-text-primary", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={twMerge(
        "font-[IBM_Plex_Mono,monospace] text-xs text-text-secondary leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;

export { Card };
