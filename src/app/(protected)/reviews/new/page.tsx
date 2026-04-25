import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/features/review/components/ReviewForm";

type Props = {
  searchParams: Promise<{ bookId?: string }>;
};

export default async function NewReviewPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const bookId = params.bookId;

  if (!bookId) {
    redirect("/books");
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold mb-6">レビューを投稿</h1>
      <ReviewForm bookId={bookId} />
    </div>
  );
}
