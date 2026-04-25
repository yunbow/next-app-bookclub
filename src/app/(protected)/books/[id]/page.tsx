import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookDetail } from "@/features/book/components/BookDetail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      userBooks: {
        where: { userId: session.user.id },
        select: {
          id: true,
          status: true,
          rating: true,
          startDate: true,
          endDate: true,
          memo: true,
          currentPage: true,
        },
      },
      bookmarks: {
        where: { userId: session.user.id },
        select: { id: true },
      },
      reviews: {
        where: { visibility: "public" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
              reactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
          userBooks: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="container max-w-6xl py-8">
      <Link href="/books" className="inline-block mb-6">
        <Button variant="ghost" size="sm" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Button>
      </Link>
      <BookDetail
        book={book}
        userBook={book.userBooks[0]}
        isBookmarked={book.bookmarks.length > 0}
      />
    </div>
  );
}
