import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserListItem } from "@/features/social/components/UserListItem";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function FollowersPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!user) {
    notFound();
  }

  const follows = await prisma.follow.findMany({
    where: { followingId: id },
    include: {
      follower: {
        select: { id: true, name: true, image: true, bio: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

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
          <CardTitle>{user.name || "名前未設定"} のフォロワー</CardTitle>
        </CardHeader>
        <CardContent>
          {follows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              フォロワーはいません
            </p>
          ) : (
            <ul className="divide-y">
              {follows.map((f) => (
                <li key={f.follower.id}>
                  <UserListItem user={f.follower} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
