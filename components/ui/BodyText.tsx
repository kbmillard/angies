import { cn } from "@/lib/utils/cn";

type Props = {
  text: string;
  className?: string;
  paragraphClassName?: string;
};

/** Renders textarea body copy with blank-line paragraph breaks preserved. */
export function BodyText({ text, className, paragraphClassName }: Props) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {paragraphs.map((para, i) => (
        <p key={i} className={cn("leading-relaxed", paragraphClassName)}>
          {para}
        </p>
      ))}
    </div>
  );
}
