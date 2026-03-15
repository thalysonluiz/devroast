import { twMerge } from "tailwind-merge";

export function Navbar({ className }: { className?: string }) {
  return (
    <nav
      className={twMerge(
        "w-full h-14 flex items-center justify-between px-4 sm:px-10 border-b border-border-primary bg-bg-page",
        className,
      )}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 font-mono no-underline">
        <span className="text-accent-green text-[20px] font-bold leading-none">
          &gt;
        </span>
        <span className="text-text-primary text-[18px] font-medium leading-none">
          devroast
        </span>
      </a>

      {/* Nav right */}
      <a
        href="/leaderboard"
        className="font-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors"
      >
        leaderboard
      </a>
    </nav>
  );
}
