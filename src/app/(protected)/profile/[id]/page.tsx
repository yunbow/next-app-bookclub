import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
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
  });

  if (!user) {
    redirect("/home");
  }

  const isOwnProfile = session.user.id === user.id;

  return (
    <div className="container max-w-4xl py-8">
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
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile && (
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    プロフィール編集
                  </Button>
                </Link>
              )}
              {isOwnProfile && (
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    設定
                  </Button>
                </Link>
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
    </div>
  );
}
