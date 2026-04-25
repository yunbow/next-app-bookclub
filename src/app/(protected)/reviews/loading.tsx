import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsLoading() {
  return (
    <div className="container max-w-6xl py-8 space-y-6" role="status" aria-label="Loading">
      {/* ヘッダー */}
      <div className="flex items-center justify-between" aria-hidden="true">
        <Skeleton className="h-8 w-48" />
      </div>

      {/* フィルタ */}
      <div className="flex flex-col md:flex-row gap-4" aria-hidden="true">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
      </div>

      {/* レビュー一覧 */}
      <div className="space-y-4" aria-hidden="true">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
