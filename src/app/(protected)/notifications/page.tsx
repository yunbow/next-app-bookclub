import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { getNotifications } from "@/features/notification/server/notification-actions";
import { NotificationList } from "@/features/notification/components/NotificationList";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { notifications } = await getNotifications(50);

  return (
    <div className="container max-w-3xl pb-8">
      <h1 className="text-3xl font-bold mb-6">通知</h1>
      <NotificationList initialNotifications={notifications} />
    </div>
  );
}
