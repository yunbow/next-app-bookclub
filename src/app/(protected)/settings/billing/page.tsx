import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BillingContent } from "@/features/settings/components/BillingContent";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <BillingContent
      subscription={subscription}
      success={params.success === "true"}
      canceled={params.canceled === "true"}
    />
  );
}
