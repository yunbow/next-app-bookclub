import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookShelf } from "@/features/library/components/BookShelf";

export default async function LibraryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's books grouped by status
  const userBooks = await prisma.userBook.findMany({
    where: { userId: session.user.id },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          coverImage: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Group books by status
  const books = {
    toRead: userBooks
      .filter((ub) => ub.status === "to_read")
      .map((ub) => ({
        ...ub.book,
        userBooks: [
          {
            status: ub.status,
            rating: ub.rating,
            currentPage: ub.currentPage,
          },
        ],
      })),
    reading: userBooks
      .filter((ub) => ub.status === "reading")
      .map((ub) => ({
        ...ub.book,
        userBooks: [
          {
            status: ub.status,
            rating: ub.rating,
            currentPage: ub.currentPage,
          },
        ],
      })),
    completed: userBooks
      .filter((ub) => ub.status === "completed")
      .map((ub) => ({
        ...ub.book,
        userBooks: [
          {
            status: ub.status,
            rating: ub.rating,
            currentPage: ub.currentPage,
          },
        ],
      })),
    paused: userBooks
      .filter((ub) => ub.status === "paused")
      .map((ub) => ({
        ...ub.book,
        userBooks: [
          {
            status: ub.status,
            rating: ub.rating,
            currentPage: ub.currentPage,
          },
        ],
      })),
  };

  const totalBooks = userBooks.length;

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">マイ本棚</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {books.reading.length}
              </p>
              <p className="text-sm text-muted-foreground">読書中</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {books.completed.length}
              </p>
              <p className="text-sm text-muted-foreground">読了</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {books.toRead.length}
              </p>
              <p className="text-sm text-muted-foreground">積読</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">
                {totalBooks}
              </p>
              <p className="text-sm text-muted-foreground">合計</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>あなたの本棚</CardTitle>
        </CardHeader>
        <CardContent>
          <BookShelf books={books} />
        </CardContent>
      </Card>
    </div>
  );
}
