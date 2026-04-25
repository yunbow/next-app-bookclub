import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container max-w-4xl py-6 space-y-6" role="status" aria-label="Loading">
      {/* ヘッダー部分 */}
      <div className="space-y-2" aria-hidden="true">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* コンテンツ一覧 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
