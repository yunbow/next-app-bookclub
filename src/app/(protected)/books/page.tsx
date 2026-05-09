import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { BookList } from "@/features/book/components/BookList";
import { BooksFilter } from "@/features/book/components/BooksFilter";
import { BooksPagination } from "@/features/book/components/BooksPagination";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

const ITEMS_PER_PAGE = 20;

export default async function BooksPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.q || "";
  const sort = params.sort || "latest";

  const where: Prisma.BookWhereInput = search
    ? { OR: [{ title: { contains: search } }, { author: { contains: search } }] }
    : {};

  const ORDER_MAP: Record<string, Prisma.BookOrderByWithRelationInput> = {
    title: { title: "asc" },
    author: { author: "asc" },
  };
  const orderBy: Prisma.BookOrderByWithRelationInput = ORDER_MAP[sort] ?? { createdAt: "desc" };

  const [books, totalCount] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        userBooks: {
          where: { userId: session.user.id },
          select: {
            status: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            userBooks: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.book.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-6xl pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">書籍一覧</h1>
          <p className="text-muted-foreground mt-1">{totalCount}冊の書籍</p>
        </div>
        <Link href="/books/new">
          <Button>書籍を登録</Button>
        </Link>
      </div>

      <BooksFilter />

      <BookList books={books} />

      <BooksPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
