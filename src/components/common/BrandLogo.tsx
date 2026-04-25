import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  label: string;
  showText?: boolean;
  iconSize?: number;
  className?: string;
  textClassName?: string;
};

export function BrandLogo({
  label,
  showText = true,
  iconSize = 32,
  className,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/bookclub-icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        priority={iconSize >= 32}
        className="shrink-0 rounded-md"
        aria-hidden="true"
      />
      {showText && (
        <span className={cn("font-bold", textClassName)}>{label}</span>
      )}
    </span>
  );
}
