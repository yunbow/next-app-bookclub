import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BookFilters } from "@/components/common/BookFilters";
import { Pagination } from "@/components/common/Pagination";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoalsList } from "@/features/reading-goal/components/GoalsList";

type Props = {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; page?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.q || "";
  const status = params.status || "";
  const sort = params.sort || "latest";

  // TODO: 実際のデータ取得ロジックを実装
  const books = [];
  const totalPages = 1;

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground">ようこそ、{session.user.name}さん</p>
        </div>
        <Link href="/books/new">
          <Button>本を追加</Button>
        </Link>
      </div>

      <div className="mb-8">
        <GoalsList />
      </div>

      <BookFilters basePath="/dashboard" showStatusFilter={true} />

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">本が見つかりませんでした</p>
          <Link href="/books/new" className="mt-4 inline-block">
            <Button>最初の本を追加</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* TODO: BookCardコンポーネントを実装 */}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/dashboard"
            searchParams={{ q: search, status, sort }}
          />
        </>
      )}
    </div>
  );
}
