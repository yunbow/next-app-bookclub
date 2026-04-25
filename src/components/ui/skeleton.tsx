import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted rounded-md",
        shimmer && "skeleton-shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
