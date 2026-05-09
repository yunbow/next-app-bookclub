import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ReviewList } from "@/features/review/components/ReviewList";
import { Pagination } from "@/components/common/Pagination";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

const ITEMS_PER_PAGE = 20;

export default async function ReviewsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.q || "";
  const sort = params.sort || "latest";

  const where: Prisma.ReviewWhereInput = {
    OR: [{ visibility: "public" }, { userId: session.user.id }],
    ...(search && { content: { contains: search, mode: "insensitive" } }),
  };

  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    sort === "rating" ? { rating: "desc" } : { createdAt: "desc" };

  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.review.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-6xl pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">レビュー</h1>
          <p className="text-muted-foreground mt-1">{totalCount}件のレビュー</p>
        </div>
      </div>

      <ReviewList reviews={reviews} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/reviews"
        searchParams={{ ...(search && { q: search }), sort }}
      />
    </div>
  );
}
