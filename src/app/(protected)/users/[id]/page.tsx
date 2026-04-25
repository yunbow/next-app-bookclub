import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FollowButton } from "@/features/social/components/FollowButton";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const viewerId = session.user.id;
  const isOwnProfile = viewerId === id;

  const [user, followersCount, followingCount, currentFollow, completedBooks] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        level: true,
        xp: true,
        createdAt: true,
        favoriteGenresList: {
          include: { genre: { select: { id: true, name: true } } },
          orderBy: { genre: { name: "asc" } },
        },
      },
    }),
    prisma.follow.count({ where: { followingId: id } }),
    prisma.follow.count({ where: { followerId: id } }),
    isOwnProfile
      ? null
      : prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: viewerId, followingId: id },
          },
          select: { id: true },
        }),
    prisma.userBook.findMany({
      where: { userId: id, status: "completed" },
      include: {
        book: {
          select: { id: true, title: true, author: true, coverImage: true },
        },
      },
      orderBy: [{ endDate: "desc" }, { updatedAt: "desc" }],
      take: 12,
    }),
  ]);

  if (!user) {
    notFound();
  }

  const isFollowing = !!currentFollow;

  return (
    <div className="container max-w-4xl pb-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name || "名前未設定"}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  レベル {user.level} (XP: {user.xp})
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <Link
                    href={`/users/${user.id}/following`}
                    className="hover:underline"
                  >
                    <span className="font-semibold">{followingCount}</span>
                    <span className="text-muted-foreground ml-1">フォロー</span>
                  </Link>
                  <Link
                    href={`/users/${user.id}/followers`}
                    className="hover:underline"
                  >
                    <span className="font-semibold">{followersCount}</span>
                    <span className="text-muted-foreground ml-1">フォロワー</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm">
                      プロフィール編集
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      設定
                    </Button>
                  </Link>
                </>
              ) : (
                <FollowButton userId={user.id} initialFollowing={isFollowing} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && (
            <div>
              <h3 className="text-sm font-medium mb-2">自己紹介</h3>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
          )}
          {user.favoriteGenresList.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">好きなジャンル</h3>
              <div className="flex flex-wrap gap-2">
                {user.favoriteGenresList.map((row) => (
                  <Badge key={row.genre.id} variant="secondary">
                    {row.genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium mb-2">登録日</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">読了した書籍 ({completedBooks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {completedBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              読了した書籍はまだありません
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {completedBooks.map((ub) => (
                <Link
                  key={ub.id}
                  href={`/books/${ub.book.id}`}
                  className="group"
                >
                  {ub.book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ub.book.coverImage}
                      alt={ub.book.title}
                      className="w-full aspect-[2/3] object-cover rounded shadow-sm group-hover:shadow-md transition-shadow"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-muted rounded flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">No Image</span>
                    </div>
                  )}
                  <p className="mt-2 text-xs font-medium line-clamp-2 group-hover:underline">
                    {ub.book.title}
                  </p>
                  {ub.book.author && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {ub.book.author}
                    </p>
                  )}
                  {ub.rating && (
                    <p className="text-xs mt-1">⭐ {ub.rating}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
