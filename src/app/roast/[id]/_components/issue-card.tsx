type IssueVariant = "critical" | "warning" | "good";

type IssueCardProps = {
  variant: IssueVariant;
  title: string;
  description: string;
};

const variantStyles: Record<
  IssueVariant,
  { dot: string; label: string; text: string }
> = {
  critical: {
    dot: "bg-accent-red",
    label: "text-accent-red",
    text: "critical",
  },
  warning: {
    dot: "bg-accent-amber",
    label: "text-accent-amber",
    text: "warning",
  },
  good: {
    dot: "bg-accent-green",
    label: "text-accent-green",
    text: "good",
  },
};

export function IssueCard({ variant, title, description }: IssueCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="flex flex-col gap-3 p-5 border border-border-primary flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
        <span className={`font-mono text-[12px] font-medium ${styles.label}`}>
          {styles.text}
        </span>
      </div>

      {/* Title */}
      <p className="font-mono text-[13px] font-medium text-text-primary">
        {title}
      </p>

      {/* Description */}
      <p
        className="text-[12px] text-text-secondary leading-relaxed"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        {description}
      </p>
    </div>
  );
}
