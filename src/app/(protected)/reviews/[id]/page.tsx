import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReviewDetail } from "@/features/review/components/ReviewDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReviewDetailPage({ params }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const review = await prisma.review.findUnique({
    where: { id },
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
          author: true,
          coverImage: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });

  if (!review) {
    notFound();
  }

  if (review.visibility !== "public" && review.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="container max-w-4xl pb-8">
      <ReviewDetail review={review} currentUserId={session.user.id} />
    </div>
  );
}
