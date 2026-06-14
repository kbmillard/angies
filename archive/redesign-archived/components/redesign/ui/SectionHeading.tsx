import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  center?: boolean;
  kickerTint?: "gold" | "orange" | "muted";
  className?: string;
  maxWidthClass?: string;
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
  center,
  kickerTint = "gold",
  className,
  maxWidthClass = "max-w-2xl",
}: Props) {
  const isCenter = center ?? align === "center";
  const kickerClass =
    kickerTint === "gold"
      ? "t-kicker t-kicker-gold"
      : kickerTint === "orange"
        ? "t-kicker t-kicker-orange"
        : "t-kicker";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        maxWidthClass,
        isCenter && "mx-auto text-center",
        className,
      )}
    >
      {kicker ? <div className={kickerClass}>{kicker}</div> : null}
      <h2 className="t-section">{title}</h2>
      {subtitle ? <p className="t-body-lg">{subtitle}</p> : null}
    </div>
  );
}
