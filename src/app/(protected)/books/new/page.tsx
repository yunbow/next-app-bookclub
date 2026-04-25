import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { BookForm } from "@/features/book/components/BookForm";

export default async function NewBookPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container max-w-3xl pb-8">
      <h1 className="text-2xl font-bold mb-6">書籍を登録</h1>
      <BookForm />
    </div>
  );
}
