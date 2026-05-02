import { cn } from "@/lib/utils/cn";

type Props = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {kicker ? (
        <p className="text-xs uppercase tracking-editorial text-cream/60">{kicker}</p>
      ) : null}
      <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-cream/75 sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
