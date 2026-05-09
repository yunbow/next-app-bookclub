import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NotificationList } from "@/features/notification/components/NotificationList";
import { Pagination } from "@/components/common/Pagination";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

const ITEMS_PER_PAGE = 20;

export default async function NotificationsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where = { recipientId: session.user.id };

  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.notification.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="container max-w-3xl pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">通知</h1>
        <p className="text-muted-foreground mt-1">{totalCount}件</p>
      </div>
      <NotificationList initialNotifications={notifications} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/notifications" />
    </div>
  );
}
