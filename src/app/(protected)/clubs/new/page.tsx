import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { EventForm } from "@/features/event/components/EventForm";

export default async function NewEventPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold mb-6">読書会を作成</h1>
      <EventForm />
    </div>
  );
}
