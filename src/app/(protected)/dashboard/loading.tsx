import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container max-w-6xl pb-8 space-y-6" role="status" aria-label="Loading">
      {/* ヘッダー */}
      <div className="flex items-center justify-between" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* フィルタ */}
      <div className="flex flex-col md:flex-row gap-4" aria-hidden="true">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
        <Skeleton className="h-10 w-full md:w-[200px]" />
      </div>

      {/* ブック一覧 */}
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
