import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/common/Pagination";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

const ITEMS_PER_PAGE = 20;

export default async function BookmarksPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where = { userId: session.user.id };

  const [bookmarks, totalCount] = await Promise.all([
    prisma.bookBookmark.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            publisher: true,
            publishedYear: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.bookBookmark.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-6xl pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ブックマーク</h1>
        <p className="text-muted-foreground mt-1">{totalCount}冊</p>
      </div>

      {bookmarks.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">
          ブックマークした本はまだありません
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <Link key={bookmark.id} href={`/books/${bookmark.book.id}`}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    {bookmark.book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bookmark.book.coverImage}
                        alt={bookmark.book.title}
                        className="w-20 h-28 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">No Image</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-2">{bookmark.book.title}</h3>
                      {bookmark.book.author && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {bookmark.book.author}
                        </p>
                      )}
                      {bookmark.book.publisher && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {bookmark.book.publisher}
                          {bookmark.book.publishedYear && ` (${bookmark.book.publishedYear})`}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} basePath="/bookmarks" />
        </>
      )}
    </div>
  );
}
