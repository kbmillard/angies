import Image from "next/image";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function BrandLogo({
  className,
  width = 160,
  height = 160,
  priority = false,
}: Props) {
  return (
    <div className={cn("relative shrink-0", className)} style={{ width, height }}>
      <Image
        src="/images/brand/site-logo.webp"
        alt="Angie's Food Truck logo"
        width={width}
        height={height}
        className="object-contain"
        priority={priority}
        sizes={`${width}px`}
      />
    </div>
  );
}
