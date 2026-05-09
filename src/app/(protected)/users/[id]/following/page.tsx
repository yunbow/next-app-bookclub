import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserListItem } from "@/features/social/components/UserListItem";
import { Pagination } from "@/components/common/Pagination";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

const ITEMS_PER_PAGE = 20;

export default async function FollowingPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!user) {
    notFound();
  }

  const where = { followerId: id };

  const [follows, totalCount] = await Promise.all([
    prisma.follow.findMany({
      where,
      include: {
        following: {
          select: { id: true, name: true, image: true, bio: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.follow.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-2xl pb-8">
      <Link
        href={`/users/${user.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:underline mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        プロフィールに戻る
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            {user.name || "名前未設定"} のフォロー中
            <span className="ml-2 text-sm font-normal text-muted-foreground">（{totalCount}人）</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {follows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              フォロー中のユーザーはいません
            </p>
          ) : (
            <ul className="divide-y">
              {follows.map((f) => (
                <li key={f.following.id}>
                  <UserListItem user={f.following} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/users/${id}/following`} />
    </div>
  );
}
